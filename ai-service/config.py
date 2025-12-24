"""AI 服务配置"""
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """应用配置"""
    # API 配置
    dashscope_api_key: str = os.getenv("DASHSCOPE_API_KEY", "")
    
    # 服务配置
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "8001"))
    
    # 模型配置
    model_name: str = os.getenv("MODEL_NAME", "qwen-plus")
    vision_model_name: str = "qwen-vl-plus"
    
    # 温度参数
    temperature: float = 0.7
    max_tokens: int = 2000
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
