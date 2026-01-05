"""AI 服务主入口 - 基于 Function Calling 的智能体架构"""
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import Optional, List, Dict
import uvicorn
import base64
import json

from config import settings
from agent import health_agent

app = FastAPI(
    title="健康管理 AI 智能体",
    description="基于 DeepSeek Function Calling 的健康管理智能体",
    version="3.0.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """根路由 - 健康检查"""
    return {
        "status": "healthy",
        "service": "health-ai-agent",
        "version": "3.0.0",
        "architecture": "Function Calling Agent with Streaming",
        "model": settings.model_name,
        "vision_model": settings.vision_model_name,
        "streaming": True,
        "image_analysis": True,
        "tools": [
            "get_medical_records",
            "view_latest_record",
            "analyze_medical_image",
            "analyze_all_images",
            "get_medical_record_stats",
            "search_medical_records",
            "compare_medical_records",
            "get_user_profile",
            "calculate_health_metrics",
            "provide_health_advice",
            "analyze_symptoms",
            "search_drug_info",
            "recommend_department",
            "record_health_data",
            "get_health_trend",
            "set_health_reminder",
            "generate_health_summary",
            "suggest_followup"
        ]
    }


@app.get("/health")
async def health_check():
    """健康检查接口"""
    return {
        "status": "healthy",
        "service": "health-ai-agent",
        "version": "3.0.0",
        "model": settings.model_name,
        "streaming": True
    }


@app.post("/api/chat")
async def chat(request: dict):
    """
    AI 智能体对话接口（流式输出）
    
    智能体会根据用户问题自动决定：
    - 是否需要查询病历记录
    - 是否需要计算健康指标
    - 是否需要提供健康建议
    - 是否需要分析症状
    
    支持流式输出，实时返回 AI 生成的内容
    """
    try:
        message = request.get("message", "")
        user_profile = request.get("userProfile")
        medical_records = request.get("medicalRecords")
        history = request.get("history")
        stream = request.get("stream", True)  # 默认启用流式输出
        
        if not message or not message.strip():
            raise HTTPException(status_code=400, detail="消息内容不能为空")
        
        print(f"\n{'='*50}")
        print(f"📨 收到用户消息: {message}")
        print(f"📋 病历记录数: {len(medical_records) if medical_records else 0}")
        print(f"👤 用户档案: {'有' if user_profile else '无'}")
        print(f"🌊 流式输出: {'是' if stream else '否'}")
        print(f"{'='*50}")
        
        if stream:
            # 流式响应
            async def generate():
                try:
                    async for chunk in health_agent.chat_stream(
                        message=message,
                        user_profile=user_profile,
                        medical_records=medical_records,
                        history=history
                    ):
                        # 使用 Server-Sent Events 格式
                        yield f"data: {json.dumps({'chunk': chunk, 'done': False})}\n\n"
                    
                    # 发送完成标记
                    yield f"data: {json.dumps({'done': True})}\n\n"
                    
                except Exception as e:
                    error_msg = f"处理错误: {str(e)}"
                    yield f"data: {json.dumps({'error': error_msg, 'done': True})}\n\n"
            
            return StreamingResponse(
                generate(),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "X-Accel-Buffering": "no"
                }
            )
        else:
            # 非流式响应（兼容旧版）
            response = await health_agent.chat(
                message=message,
                user_profile=user_profile,
                medical_records=medical_records,
                history=history
            )
            return {"response": response, "success": True}
        
    except Exception as e:
        print(f"智能体处理错误: {e}")
        import traceback
        traceback.print_exc()
        return {
            "response": f"抱歉，处理您的请求时出现错误: {str(e)}",
            "success": False
        }


@app.post("/api/analyze-image")
async def analyze_image(
    file: UploadFile = File(...),
    message: str = Form(default="请分析这张医疗图片")
):
    """
    图片分析接口
    
    上传医疗图片进行 AI 分析（使用 DeepSeek-VL）
    """
    try:
        # 读取图片并转为 base64
        contents = await file.read()
        base64_image = base64.b64encode(contents).decode('utf-8')
        
        # 获取文件类型
        content_type = file.content_type or "image/jpeg"
        image_url = f"data:{content_type};base64,{base64_image}"
        
        # 调用 AI 分析
        response = await health_agent.analyze_image(image_url, None)
        
        return {"response": response, "success": True}
        
    except Exception as e:
        print(f"图片分析错误: {e}")
        import traceback
        traceback.print_exc()
        return {
            "response": f"抱歉，图片分析时出现错误: {str(e)}",
            "success": False
        }


@app.post("/api/analyze-image-url")
async def analyze_image_url(request: dict):
    """
    通过 URL 分析图片（使用 DeepSeek-VL）
    """
    try:
        image_url = request.get("imageUrl")
        message = request.get("message", "请分析这张医疗图片")
        user_profile = request.get("userProfile")
        
        if not image_url:
            raise HTTPException(status_code=400, detail="需要提供图片 URL")
        
        # 调用 AI 分析
        response = await health_agent.analyze_image(image_url, user_profile)
        
        return {"response": response, "success": True}
        
    except Exception as e:
        print(f"图片分析错误: {e}")
        import traceback
        traceback.print_exc()
        return {
            "response": f"抱歉，图片分析时出现错误: {str(e)}",
            "success": False
        }


@app.post("/api/analyze")
async def analyze_health(request: dict):
    """
    健康分析接口
    
    根据用户档案提供健康分析建议
    """
    try:
        user_profile = request.get("userProfile")
        medical_records = request.get("medicalRecords")
        history = request.get("history")
        
        if not user_profile:
            raise HTTPException(status_code=400, detail="需要提供用户健康档案")
        
        analysis_prompt = """
请根据我的健康档案和病历记录，提供以下分析：
1. 整体健康状况评估
2. BMI 分析（如果有身高体重数据）
3. 病历记录分析总结
4. 需要关注的健康风险
5. 个性化健康建议
6. 建议进行的体检项目
"""
        
        response = await health_agent.chat(
            message=analysis_prompt,
            user_profile=user_profile,
            medical_records=medical_records,
            history=history
        )
        
        return {"response": response, "success": True}
        
    except Exception as e:
        print(f"健康分析错误: {e}")
        return {
            "response": f"抱歉，分析过程中出现错误: {str(e)}",
            "success": False
        }


if __name__ == "__main__":
    print(f"🚀 启动健康管理 AI 智能体")
    print(f"📍 地址: http://{settings.host}:{settings.port}")
    print(f"🤖 文本模型: {settings.model_name} (DeepSeek)")
    print(f"🖼️ 视觉模型: {settings.vision_model_name} (DeepSeek-VL)")
    print(f"🌊 流式输出: ✅ 已启用")
    print(f"📷 图片分析: ✅ 已启用")
    print(f"🔧 架构: Function Calling Agent (ReAct) with Streaming")
    print(f"📦 可用工具:")
    print(f"   - get_medical_records: 获取病历列表")
    print(f"   - view_latest_record: 查看并分析最近病历图片")
    print(f"   - analyze_medical_image: 分析指定病历图片")
    print(f"   - analyze_all_images: 分析所有病历图片")
    print(f"   - get_medical_record_stats: 病历统计")
    print(f"   - search_medical_records: 搜索病历")
    print(f"   - compare_medical_records: 对比病历")
    print(f"   - get_user_profile: 获取用户健康档案")
    print(f"   - calculate_health_metrics: 计算健康指标")
    print(f"   - provide_health_advice: 提供健康建议")
    print(f"   - analyze_symptoms: 分析症状")
    print(f"   - search_drug_info: 查询药物信息")
    print(f"   - recommend_department: 推荐就诊科室")
    print(f"   - record_health_data: 记录健康数据")
    print(f"   - get_health_trend: 健康趋势分析")
    print(f"   - set_health_reminder: 设置提醒")
    print(f"   - generate_health_summary: 生成健康摘要")
    print(f"   - suggest_followup: 复查建议")
    print(f"{'='*50}")
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True
    )
