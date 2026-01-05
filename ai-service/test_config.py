"""测试配置是否正确加载"""
from config import settings

print("=" * 50)
print("🔧 当前配置信息：")
print("=" * 50)
print(f"API Key: {settings.deepseek_api_key[:20]}...")
print(f"Base URL: {settings.deepseek_base_url}")
print(f"模型名称: {settings.model_name}")
print(f"视觉模型: {settings.vision_model_name}")
print(f"Host: {settings.host}")
print(f"Port: {settings.port}")
print("=" * 50)

