"""AI 服务配置"""
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """应用配置"""
    # DeepSeek API 配置
    deepseek_api_key: str = os.getenv("DEEPSEEK_API_KEY", "")
    deepseek_base_url: str = "https://api.deepseek.com"
    
    # 服务配置
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "8001"))
    
    # 模型配置
    model_name: str = os.getenv("MODEL_NAME", "deepseek-chat")
    vision_model_name: str = os.getenv("VISION_MODEL_NAME", "deepseek-vl")
    
    # 温度参数
    temperature: float = 0.7
    max_tokens: int = 2000
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
