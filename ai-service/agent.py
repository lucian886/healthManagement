"""健康管理智能体 - 基于 DeepSeek Function Calling 的智能体架构"""
from typing import List, Dict, Optional, Any, AsyncGenerator
from openai import AsyncOpenAI
from config import settings
from tools import TOOLS, ToolExecutor
import json

# 初始化 DeepSeek 客户端
client = AsyncOpenAI(
    api_key=settings.deepseek_api_key,
    base_url=settings.deepseek_base_url
)


class HealthAgent:
    """健康管理智能体 - 支持 Function Calling 和流式输出"""
    
    def __init__(self):
        """初始化智能体"""
        self.system_prompt = """你是一位专业的健康管理AI智能体，名叫"健康小助手"。

## 你的能力
你可以使用以下工具来帮助用户：

### 病历管理
1. **get_medical_records** - 查看用户的病历记录列表
2. **view_latest_record** - 查看并分析最近一份病历图片内容
3. **analyze_medical_image** - 分析指定病历的医疗图片
4. **analyze_all_images** - 分析所有病历图片并给出综合评估
5. **get_medical_record_stats** - 获取病历统计信息
6. **search_medical_records** - 搜索病历记录
7. **compare_medical_records** - 对比两份病历

### 健康数据
8. **get_user_profile** - 获取用户的健康档案
9. **calculate_health_metrics** - 计算 BMI、每日热量等健康指标
10. **record_health_data** - 记录用户的健康数据（体重、血压、血糖等）
11. **get_health_trend** - 获取健康数据趋势分析

### 健康咨询
12. **analyze_symptoms** - 分析用户描述的症状，给出可能原因
13. **search_drug_info** - 查询药物信息（用法、副作用、禁忌等）
14. **recommend_department** - 根据症状推荐就诊科室
15. **provide_health_advice** - 提供个性化健康建议
16. **generate_health_summary** - 生成健康摘要报告
17. **suggest_followup** - 建议复查计划

### 健康管理
18. **set_health_reminder** - 设置健康提醒（吃药、复查、运动等）

## 工作原则
1. 当用户说"看病历内容"、"分析最近的检查报告"，调用 view_latest_record
2. 当用户想分析某份病历图片，调用 analyze_medical_image
3. 当用户描述症状（如"我头疼"、"肚子不舒服"），调用 analyze_symptoms
4. 当用户问药物相关（如"布洛芬怎么吃"），调用 search_drug_info
5. 当用户问该看什么科，调用 recommend_department
6. 当用户要记录数据（如"记录体重70kg"），调用 record_health_data
7. 当用户要设置提醒（如"提醒我吃药"），调用 set_health_reminder
8. 当用户问病历统计，调用 get_medical_record_stats
9. 如果一个问题需要多个步骤，依次调用相关工具
10. 始终基于工具返回的真实数据回答，不要编造

## 重要提醒
- 对于严重症状，务必建议用户及时就医
- 不做具体诊断，只提供健康知识和建议
- 使用通俗易懂的语言
- 分析结果仅供参考，不能替代专业医生诊断
- 用药建议仅供参考，请遵医嘱"""

        self.max_iterations = 5  # 最大工具调用次数
    
    async def chat_stream(
        self, 
        message: str, 
        user_profile: Optional[Dict] = None,
        medical_records: Optional[List[Dict]] = None,
        history: Optional[List[Dict]] = None
    ) -> AsyncGenerator[str, None]:
        """处理用户消息 - 智能体主循环（流式输出）"""
        try:
            # 初始化工具执行器
            tool_executor = ToolExecutor(user_profile, medical_records)
            tool_executor.set_image_analyzer(self._analyze_image_with_deepseek)
            
            # 构建消息历史
            messages = self._build_messages(message, history)
            
            # 智能体循环（ReAct 模式）
            for iteration in range(self.max_iterations):
                print(f"\n=== 智能体迭代 {iteration + 1} ===")
                
                # 调用 DeepSeek API（流式）
                stream = await client.chat.completions.create(
                    model=settings.model_name,
                    messages=messages,
                    tools=TOOLS,
                    temperature=settings.temperature,
                    max_tokens=settings.max_tokens,
                    stream=True
                )
                
                # 收集流式响应
                assistant_message = {"role": "assistant", "content": ""}
                tool_calls_data = {}
                current_tool_call_id = None
                
                async for chunk in stream:
                    if not chunk.choices:
                        continue
                    
                    delta = chunk.choices[0].delta
                    
                    # 处理内容流
                    if delta.content:
                        assistant_message["content"] += delta.content
                        # 实时输出内容流
                        yield delta.content
                    
                    # 处理工具调用
                    if delta.tool_calls:
                        for tool_call_chunk in delta.tool_calls:
                            idx = tool_call_chunk.index
                            if idx not in tool_calls_data:
                                tool_calls_data[idx] = {
                                    "id": "",
                                    "type": "function",
                                    "function": {
                                        "name": "",
                                        "arguments": ""
                                    }
                                }
                            
                            if tool_call_chunk.id:
                                tool_calls_data[idx]["id"] = tool_call_chunk.id
                            
                            if tool_call_chunk.function:
                                if tool_call_chunk.function.name:
                                    tool_calls_data[idx]["function"]["name"] = tool_call_chunk.function.name
                                if tool_call_chunk.function.arguments:
                                    tool_calls_data[idx]["function"]["arguments"] += tool_call_chunk.function.arguments
                
                # 检查是否有工具调用
                if tool_calls_data:
                    tool_calls = list(tool_calls_data.values())
                    assistant_message["tool_calls"] = tool_calls
                    messages.append(assistant_message)
                    
                    # 执行工具调用
                    for tool_call in tool_calls:
                        function_name = tool_call['function']['name']
                        function_args = json.loads(tool_call['function']['arguments'])
                        
                        print(f"📞 调用工具: {function_name}")
                        print(f"   参数: {function_args}")
                        
                        # 输出工具调用信息
                        yield f"\n\n[调用工具: {function_name}]\n"
                        
                        # 执行工具
                        tool_result = await tool_executor.execute(function_name, function_args)
                        
                        print(f"   结果: {tool_result[:100]}..." if len(tool_result) > 100 else f"   结果: {tool_result}")
                        
                        # 将工具结果添加到消息
                        messages.append({
                            "role": "tool",
                            "content": tool_result,
                            "tool_call_id": tool_call['id']
                        })
                    
                    # 继续下一轮迭代，让AI基于工具结果生成回复
                    continue
                else:
                    # 没有工具调用，返回完成
                    print(f"✅ 最终回复完成")
                    return
            
            # 达到最大迭代次数
            yield "\n\n抱歉，处理您的请求时遇到了复杂情况，请尝试简化您的问题。"
                
        except Exception as e:
            print(f"智能体处理出错: {e}")
            import traceback
            traceback.print_exc()
            yield f"\n\n抱歉，处理您的请求时出现错误: {str(e)}"
    
    async def chat(
        self, 
        message: str, 
        user_profile: Optional[Dict] = None,
        medical_records: Optional[List[Dict]] = None,
        history: Optional[List[Dict]] = None
    ) -> str:
        """处理用户消息 - 非流式版本（兼容性）"""
        result = []
        async for chunk in self.chat_stream(message, user_profile, medical_records, history):
            result.append(chunk)
        return "".join(result)
    
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
    
    async def _analyze_image_with_deepseek(
        self,
        message: str,
        image_url: str,
        user_profile: Optional[Dict] = None
    ) -> str:
        """使用 DeepSeek-VL 分析图片"""
        try:
            # DeepSeek 暂时不支持视觉模型或需要不同的调用方式
            # 暂时返回提示信息
            return "抱歉，DeepSeek 的视觉模型功能暂时不可用。请直接描述病历内容或使用其他方式。"
                
        except Exception as e:
            print(f"图片分析出错: {e}")
            import traceback
            traceback.print_exc()
            return f"抱歉，图片分析时出现错误: {str(e)}"
    
    async def analyze_image(
        self, 
        image_url: str, 
        user_profile: Optional[Dict] = None
    ) -> str:
        """分析医疗图片（公开方法）"""
        prompt = """请仔细分析这张医疗相关的图片，提供以下分析：
1. 这是什么类型的医疗文件/图片？
2. 图片中的主要内容是什么？
3. 关键指标有哪些？是否有异常？
4. 根据图片内容，有什么健康建议？
5. 是否需要进一步就医或复查？

请用通俗易懂的语言解释。"""
        
        return await self._analyze_image_with_deepseek(prompt, image_url, user_profile)


# 创建单例
health_agent = HealthAgent()
