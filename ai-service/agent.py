"""健康管理智能体 - 基于 Function Calling 的真正智能体架构"""
from typing import List, Dict, Optional, Any
import dashscope
from dashscope import Generation, MultiModalConversation
from config import settings
from tools import TOOLS, ToolExecutor
import json

# 设置 API Key
dashscope.api_key = settings.dashscope_api_key


class HealthAgent:
    """健康管理智能体 - 支持 Function Calling 和 ReAct 模式"""
    
    def __init__(self):
        """初始化智能体"""
        self.system_prompt = """你是一位专业的健康管理AI智能体，名叫"健康小助手"。

## 你的能力
你可以使用以下工具来帮助用户：

### 病历管理
1. **get_medical_records** - 查看用户的病历记录列表
2. **view_latest_record** - 查看并分析最近一份病历的图片内容
3. **analyze_medical_image** - 分析指定ID的病历医疗图片
4. **analyze_all_images** - 分析所有病历图片并给出综合评估

### 健康数据
5. **get_user_profile** - 获取用户的健康档案
6. **calculate_health_metrics** - 计算 BMI、每日热量等健康指标
7. **record_health_data** - 记录用户的健康数据（体重、血压、血糖等）
8. **get_health_trend** - 获取健康数据趋势分析

### 健康咨询
9. **analyze_symptoms** - 分析用户描述的症状，给出可能原因
10. **search_drug_info** - 查询药物信息（用法、副作用、禁忌等）
11. **recommend_department** - 根据症状推荐就诊科室
12. **provide_health_advice** - 提供个性化健康建议

### 健康管理
13. **set_health_reminder** - 设置健康提醒（吃药、复查、运动等）

## 工作原则
1. 当用户描述症状（如"我头疼"、"肚子不舒服"），调用 analyze_symptoms
2. 当用户问药物相关（如"布洛芬怎么吃"），调用 search_drug_info
3. 当用户问该看什么科，调用 recommend_department
4. 当用户要记录数据（如"记录体重70kg"），调用 record_health_data
5. 当用户要设置提醒（如"提醒我吃药"），调用 set_health_reminder
6. 当用户说"看病历内容"，调用 view_latest_record 分析图片
7. 如果一个问题需要多个步骤，依次调用相关工具
8. 始终基于工具返回的真实数据回答，不要编造

## 重要提醒
- 对于严重症状，务必建议用户及时就医
- 不做具体诊断，只提供健康知识和建议
- 使用通俗易懂的语言
- 分析结果仅供参考，不能替代专业医生诊断
- 用药建议仅供参考，请遵医嘱"""

        self.max_iterations = 5  # 最大工具调用次数
    
    async def chat(
        self, 
        message: str, 
        user_profile: Optional[Dict] = None,
        medical_records: Optional[List[Dict]] = None,
        history: Optional[List[Dict]] = None,
        image_url: Optional[str] = None
    ) -> str:
        """处理用户消息 - 智能体主循环"""
        try:
            # 如果有直接传入的图片 URL，直接分析
            if image_url:
                return await self._analyze_image_direct(message, image_url, user_profile)
            
            # 初始化工具执行器
            tool_executor = ToolExecutor(user_profile, medical_records)
            tool_executor.set_image_analyzer(self._analyze_image_direct)
            
            # 构建消息历史
            messages = self._build_messages(message, history)
            
            # 智能体循环（ReAct 模式）
            for iteration in range(self.max_iterations):
                print(f"\n=== 智能体迭代 {iteration + 1} ===")
                
                # 调用 LLM
                response = Generation.call(
                    model=settings.model_name,
                    messages=messages,
                    tools=TOOLS,
                    result_format='message'
                )
                
                if response.status_code != 200:
                    print(f"API 调用失败: {response.code} - {response.message}")
                    return f"抱歉，服务暂时不可用。错误代码: {response.code}"
                
                assistant_message = response.output.choices[0].message
                
                # 检查是否有工具调用
                tool_calls = assistant_message.get('tool_calls')
                
                if tool_calls:
                    # 执行工具调用
                    messages.append(assistant_message)
                    
                    for tool_call in tool_calls:
                        function_name = tool_call['function']['name']
                        function_args = json.loads(tool_call['function']['arguments'])
                        
                        print(f"📞 调用工具: {function_name}")
                        print(f"   参数: {function_args}")
                        
                        # 执行工具
                        tool_result = await tool_executor.execute(function_name, function_args)
                        
                        print(f"   结果: {tool_result[:100]}..." if len(tool_result) > 100 else f"   结果: {tool_result}")
                        
                        # 将工具结果添加到消息
                        messages.append({
                            "role": "tool",
                            "content": tool_result,
                            "tool_call_id": tool_call['id']
                        })
                else:
                    # 没有工具调用，返回最终回复
                    final_response = assistant_message.get('content', '')
                    print(f"✅ 最终回复: {final_response[:100]}...")
                    return final_response
            
            # 达到最大迭代次数
            return "抱歉，处理您的请求时遇到了复杂情况，请尝试简化您的问题。"
                
        except Exception as e:
            print(f"智能体处理出错: {e}")
            import traceback
            traceback.print_exc()
            return f"抱歉，处理您的请求时出现错误: {str(e)}"
    
    def _build_messages(self, message: str, history: Optional[List[Dict]] = None) -> List[Dict]:
        """构建消息列表"""
        messages = [{"role": "system", "content": self.system_prompt}]
        
        # 添加历史消息
        if history:
            for msg in history[-10:]:  # 最多保留10条历史
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
        
        # 添加当前消息
        messages.append({"role": "user", "content": message})
        
        return messages
    
    async def _analyze_image_direct(
        self,
        message: str,
        image_url: str,
        user_profile: Optional[Dict] = None
    ) -> str:
        """直接分析图片（使用视觉模型）"""
        try:
            # 构建上下文
            context = ""
            if user_profile:
                context = f"\n\n用户信息：性别={user_profile.get('gender', '未知')}, 年龄={user_profile.get('birthDate', '未知')}"
            
            full_message = f"{message}{context}"
            
            # 构建多模态消息
            messages = [
                {
                    "role": "user",
                    "content": [
                        {"image": image_url},
                        {"text": full_message}
                    ]
                }
            ]
            
            # 调用视觉模型
            response = MultiModalConversation.call(
                model='qwen-vl-plus',
                messages=messages
            )
            
            if response.status_code == 200:
                return response.output.choices[0].message.content[0]["text"]
            else:
                print(f"视觉模型调用失败: {response.code} - {response.message}")
                return f"抱歉，图片分析服务暂时不可用。错误代码: {response.code}"
                
        except Exception as e:
            print(f"图片分析出错: {e}")
            return f"抱歉，图片分析时出现错误: {str(e)}"
    
    async def analyze_image(self, image_url: str, user_profile: Optional[Dict] = None) -> str:
        """分析医疗图片（公开方法）"""
        prompt = """请仔细分析这张医疗相关的图片，提供以下分析：
1. 这是什么类型的医疗文件/图片？
2. 图片中的主要内容是什么？
3. 关键指标有哪些？是否有异常？
4. 根据图片内容，有什么健康建议？
5. 是否需要进一步就医或复查？

请用通俗易懂的语言解释。"""
        
        return await self._analyze_image_direct(prompt, image_url, user_profile)


# 创建单例
health_agent = HealthAgent()
