"""AI 服务主入口 - 基于 Function Calling 的智能体架构"""
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict
import uvicorn
import base64

from config import settings
from agent import health_agent

app = FastAPI(
    title="健康管理 AI 智能体",
    description="基于通义千问 Function Calling 的健康管理智能体",
    version="2.0.0"
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
        "version": "2.0.0",
        "architecture": "Function Calling Agent",
        "model": settings.model_name,
        "vision_model": "qwen-vl-plus",
        "tools": [
            "get_medical_records",
            "analyze_medical_image", 
            "analyze_all_images",
            "get_user_profile",
            "calculate_health_metrics",
            "provide_health_advice"
        ]
    }


@app.get("/health")
async def health_check():
    """健康检查接口"""
    return {
        "status": "healthy",
        "service": "health-ai-agent",
        "version": "2.0.0",
        "model": settings.model_name
    }


@app.post("/api/chat")
async def chat(request: dict):
    """
    AI 智能体对话接口
    
    智能体会根据用户问题自动决定：
    - 是否需要查询病历记录
    - 是否需要分析病历图片
    - 是否需要计算健康指标
    - 是否需要提供健康建议
    """
    try:
        message = request.get("message", "")
        user_profile = request.get("userProfile")
        medical_records = request.get("medicalRecords")
        history = request.get("history")
        image_url = request.get("imageUrl")  # 可选的图片 URL
        
        if not message or not message.strip():
            raise HTTPException(status_code=400, detail="消息内容不能为空")
        
        print(f"\n{'='*50}")
        print(f"📨 收到用户消息: {message}")
        print(f"📋 病历记录数: {len(medical_records) if medical_records else 0}")
        print(f"👤 用户档案: {'有' if user_profile else '无'}")
        print(f"{'='*50}")
        
        response = await health_agent.chat(
            message=message,
            user_profile=user_profile,
            medical_records=medical_records,
            history=history,
            image_url=image_url
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
    
    上传医疗图片进行 AI 分析
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
        return {
            "response": f"抱歉，图片分析时出现错误: {str(e)}",
            "success": False
        }


@app.post("/api/analyze-image-url")
async def analyze_image_url(request: dict):
    """
    通过 URL 分析图片
    """
    try:
        image_url = request.get("imageUrl")
        message = request.get("message", "请分析这张医疗图片")
        user_profile = request.get("userProfile")
        
        if not image_url:
            raise HTTPException(status_code=400, detail="需要提供图片 URL")
        
        response = await health_agent._chat_with_image(message, image_url, user_profile, None)
        
        return {"response": response, "success": True}
        
    except Exception as e:
        print(f"图片分析错误: {e}")
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
    print(f"🤖 文本模型: {settings.model_name}")
    print(f"🖼️ 视觉模型: qwen-vl-plus")
    print(f"🔧 架构: Function Calling Agent (ReAct)")
    print(f"📦 可用工具:")
    print(f"   - get_medical_records: 获取病历列表")
    print(f"   - analyze_medical_image: 分析单张病历图片")
    print(f"   - analyze_all_images: 分析所有病历图片")
    print(f"   - get_user_profile: 获取用户健康档案")
    print(f"   - calculate_health_metrics: 计算健康指标")
    print(f"   - provide_health_advice: 提供健康建议")
    print(f"{'='*50}")
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True
    )
