"""智能体工具定义"""
from typing import List, Dict, Optional, Any

# 工具定义（符合 OpenAI Function Calling 格式）
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_medical_records",
            "description": "获取用户的病历记录列表。当用户询问病历数量、病历列表、有哪些病历时调用此工具。",
            "parameters": {
                "type": "object",
                "properties": {
                    "record_type": {
                        "type": "string",
                        "description": "可选，筛选特定类型的病历，如：检查报告、化验单、CT、MRI、X光片等"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "view_latest_record",
            "description": "查看并分析最近一份或指定顺序的病历图片内容。当用户说'看看最近的病历'、'帮我看下最近一份病历内容'、'查看最新的检查报告'等时调用此工具。",
            "parameters": {
                "type": "object",
                "properties": {
                    "position": {
                        "type": "string",
                        "enum": ["latest", "second", "third"],
                        "description": "要查看的病历位置：latest=最近一份，second=第二份，third=第三份"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "analyze_medical_image",
            "description": "分析指定病历的医疗图片。当用户想要分析某份病历的检查结果、化验单内容时调用此工具。",
            "parameters": {
                "type": "object",
                "properties": {
                    "record_id": {
                        "type": "integer",
                        "description": "要分析的病历ID"
                    },
                    "analysis_focus": {
                        "type": "string",
                        "description": "分析重点，如：异常指标、整体评估、特定项目等"
                    }
                },
                "required": ["record_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "analyze_all_images",
            "description": "分析用户所有的病历图片并给出综合评估。当用户想要全面了解自己的健康状况、分析所有检查结果时调用此工具。",
            "parameters": {
                "type": "object",
                "properties": {
                    "max_count": {
                        "type": "integer",
                        "description": "最多分析的病历数量，默认5"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_user_profile",
            "description": "获取用户的健康档案信息（身高、体重、血型、过敏史、病史等）。当需要了解用户基本健康信息时调用。",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_health_metrics",
            "description": "计算用户的健康指标，如BMI、每日所需热量等。",
            "parameters": {
                "type": "object",
                "properties": {
                    "metric_type": {
                        "type": "string",
                        "enum": ["bmi", "daily_calories", "ideal_weight", "all"],
                        "description": "要计算的指标类型"
                    }
                },
                "required": ["metric_type"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "provide_health_advice",
            "description": "根据用户的健康档案和病历记录，提供个性化的健康建议。",
            "parameters": {
                "type": "object",
                "properties": {
                    "advice_type": {
                        "type": "string",
                        "enum": ["diet", "exercise", "sleep", "medication", "followup", "general"],
                        "description": "建议类型：饮食、运动、睡眠、用药、复查、综合"
                    }
                },
                "required": ["advice_type"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "analyze_symptoms",
            "description": "分析用户描述的症状，给出可能的原因和建议。当用户说'我头疼'、'最近总是觉得累'、'肚子不舒服'等描述症状时调用。",
            "parameters": {
                "type": "object",
                "properties": {
                    "symptoms": {
                        "type": "string",
                        "description": "用户描述的症状"
                    },
                    "duration": {
                        "type": "string",
                        "description": "症状持续时间，如：刚开始、几天、一周、一个月"
                    },
                    "severity": {
                        "type": "string",
                        "enum": ["mild", "moderate", "severe"],
                        "description": "症状严重程度：轻微、中等、严重"
                    }
                },
                "required": ["symptoms"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_drug_info",
            "description": "查询药物信息，包括用法用量、注意事项、副作用等。当用户问'阿莫西林怎么吃'、'布洛芬的副作用'等时调用。",
            "parameters": {
                "type": "object",
                "properties": {
                    "drug_name": {
                        "type": "string",
                        "description": "药物名称"
                    },
                    "info_type": {
                        "type": "string",
                        "enum": ["usage", "side_effects", "contraindications", "interactions", "all"],
                        "description": "查询信息类型：用法、副作用、禁忌、相互作用、全部"
                    }
                },
                "required": ["drug_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "record_health_data",
            "description": "记录用户的健康数据，如体重、血压、血糖等。当用户说'记录一下我今天的体重是70kg'、'血压130/80'时调用。",
            "parameters": {
                "type": "object",
                "properties": {
                    "data_type": {
                        "type": "string",
                        "enum": ["weight", "blood_pressure", "blood_sugar", "heart_rate", "temperature", "sleep", "exercise", "diet"],
                        "description": "数据类型"
                    },
                    "value": {
                        "type": "string",
                        "description": "数值，如：70kg、130/80、6.5mmol/L"
                    },
                    "note": {
                        "type": "string",
                        "description": "备注信息"
                    }
                },
                "required": ["data_type", "value"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_health_trend",
            "description": "获取用户健康数据的趋势分析。当用户问'我最近体重变化怎么样'、'血压趋势'时调用。",
            "parameters": {
                "type": "object",
                "properties": {
                    "data_type": {
                        "type": "string",
                        "enum": ["weight", "blood_pressure", "blood_sugar", "heart_rate", "all"],
                        "description": "要查看趋势的数据类型"
                    },
                    "days": {
                        "type": "integer",
                        "description": "查看最近多少天的数据，默认30天"
                    }
                },
                "required": ["data_type"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "set_health_reminder",
            "description": "设置健康提醒，如吃药提醒、复查提醒等。当用户说'提醒我每天吃药'、'下周三提醒我去复查'时调用。",
            "parameters": {
                "type": "object",
                "properties": {
                    "reminder_type": {
                        "type": "string",
                        "enum": ["medication", "checkup", "exercise", "water", "custom"],
                        "description": "提醒类型：吃药、复查、运动、喝水、自定义"
                    },
                    "content": {
                        "type": "string",
                        "description": "提醒内容"
                    },
                    "time": {
                        "type": "string",
                        "description": "提醒时间，如：每天8:00、明天下午3点、每周一"
                    }
                },
                "required": ["reminder_type", "content"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "recommend_department",
            "description": "根据症状推荐就诊科室。当用户问'我应该看什么科'、'头疼挂什么号'时调用。",
            "parameters": {
                "type": "object",
                "properties": {
                    "symptoms": {
                        "type": "string",
                        "description": "症状描述"
                    }
                },
                "required": ["symptoms"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_medical_record_stats",
            "description": "获取病历统计信息，包括类型分布、医院分布、时间趋势等。当用户问'我有多少份病历'、'病历统计'、'去过哪些医院'时调用。",
            "parameters": {
                "type": "object",
                "properties": {
                    "stat_type": {
                        "type": "string",
                        "enum": ["summary", "by_type", "by_hospital", "by_year", "all"],
                        "description": "统计类型：概览、按类型、按医院、按年份、全部"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "compare_medical_records",
            "description": "对比两份病历，分析变化趋势。当用户说'对比一下我两次的体检结果'、'上次和这次的检查有什么变化'时调用。",
            "parameters": {
                "type": "object",
                "properties": {
                    "record_type": {
                        "type": "string",
                        "description": "要对比的病历类型，如：检查报告、化验单、体检报告"
                    },
                    "record_id_1": {
                        "type": "integer",
                        "description": "第一份病历ID（较早的）"
                    },
                    "record_id_2": {
                        "type": "integer",
                        "description": "第二份病历ID（较新的）"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "generate_health_summary",
            "description": "根据所有病历生成健康摘要报告。当用户说'帮我总结一下健康状况'、'生成健康报告'、'我的健康档案摘要'时调用。",
            "parameters": {
                "type": "object",
                "properties": {
                    "include_recommendations": {
                        "type": "boolean",
                        "description": "是否包含健康建议，默认true"
                    },
                    "time_range": {
                        "type": "string",
                        "enum": ["recent", "half_year", "one_year", "all"],
                        "description": "时间范围：最近、半年、一年、全部"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "suggest_followup",
            "description": "根据病历记录建议复查计划。当用户问'我需要做什么复查'、'什么时候该去医院'、'复查提醒'时调用。",
            "parameters": {
                "type": "object",
                "properties": {
                    "record_type": {
                        "type": "string",
                        "description": "可选，针对特定类型的复查建议"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_medical_records",
            "description": "搜索病历记录。当用户说'找一下xx医院的病历'、'搜索xx检查'、'找xx年的病历'时调用。",
            "parameters": {
                "type": "object",
                "properties": {
                    "keyword": {
                        "type": "string",
                        "description": "搜索关键词"
                    },
                    "hospital": {
                        "type": "string",
                        "description": "医院名称筛选"
                    },
                    "record_type": {
                        "type": "string",
                        "description": "病历类型筛选"
                    },
                    "year": {
                        "type": "string",
                        "description": "年份筛选"
                    }
                },
                "required": []
            }
        }
    }
]


class ToolExecutor:
    """工具执行器"""
    
    def __init__(self, user_profile: Optional[Dict] = None, medical_records: Optional[List[Dict]] = None):
        self.user_profile = user_profile or {}
        self.medical_records = medical_records or []
        self.image_analyzer = None  # 会在运行时设置
    
    def set_image_analyzer(self, analyzer):
        """设置图片分析器"""
        self.image_analyzer = analyzer
    
    async def execute(self, tool_name: str, arguments: Dict[str, Any]) -> str:
        """执行工具并返回结果"""
        try:
            if tool_name == "get_medical_records":
                return self._get_medical_records(arguments.get("record_type"))
            elif tool_name == "view_latest_record":
                return await self._view_latest_record(arguments.get("position", "latest"))
            elif tool_name == "analyze_medical_image":
                return await self._analyze_medical_image(
                    arguments.get("record_id"),
                    arguments.get("analysis_focus", "")
                )
            elif tool_name == "analyze_all_images":
                return await self._analyze_all_images(arguments.get("max_count", 5))
            elif tool_name == "get_user_profile":
                return self._get_user_profile()
            elif tool_name == "calculate_health_metrics":
                return self._calculate_health_metrics(arguments.get("metric_type", "all"))
            elif tool_name == "provide_health_advice":
                return self._provide_health_advice(arguments.get("advice_type", "general"))
            elif tool_name == "analyze_symptoms":
                return self._analyze_symptoms(
                    arguments.get("symptoms", ""),
                    arguments.get("duration"),
                    arguments.get("severity")
                )
            elif tool_name == "search_drug_info":
                return self._search_drug_info(
                    arguments.get("drug_name", ""),
                    arguments.get("info_type", "all")
                )
            elif tool_name == "record_health_data":
                return self._record_health_data(
                    arguments.get("data_type"),
                    arguments.get("value"),
                    arguments.get("note")
                )
            elif tool_name == "get_health_trend":
                return self._get_health_trend(
                    arguments.get("data_type", "all"),
                    arguments.get("days", 30)
                )
            elif tool_name == "set_health_reminder":
                return self._set_health_reminder(
                    arguments.get("reminder_type"),
                    arguments.get("content"),
                    arguments.get("time")
                )
            elif tool_name == "recommend_department":
                return self._recommend_department(arguments.get("symptoms", ""))
            elif tool_name == "get_medical_record_stats":
                return self._get_medical_record_stats(arguments.get("stat_type", "summary"))
            elif tool_name == "compare_medical_records":
                return await self._compare_medical_records(
                    arguments.get("record_type"),
                    arguments.get("record_id_1"),
                    arguments.get("record_id_2")
                )
            elif tool_name == "generate_health_summary":
                return await self._generate_health_summary(
                    arguments.get("include_recommendations", True),
                    arguments.get("time_range", "all")
                )
            elif tool_name == "suggest_followup":
                return self._suggest_followup(arguments.get("record_type"))
            elif tool_name == "search_medical_records":
                return self._search_medical_records(
                    arguments.get("keyword"),
                    arguments.get("hospital"),
                    arguments.get("record_type"),
                    arguments.get("year")
                )
            else:
                return f"未知工具: {tool_name}"
        except Exception as e:
            return f"工具执行错误: {str(e)}"
    
    def _get_medical_records(self, record_type: Optional[str] = None) -> str:
        """获取病历记录"""
        if not self.medical_records:
            return "📋 您目前没有上传任何病历记录。建议您在「病历管理」中上传检查报告、化验单等医疗文件。"
        
        records = self.medical_records
        if record_type:
            records = [r for r in records if record_type.lower() in (r.get('recordType', '') or '').lower()]
        
        if not records:
            return f"📋 没有找到类型为「{record_type}」的病历记录。"
        
        result = [f"📋 **您的病历记录**（共 {len(records)} 份）\n"]
        
        for i, record in enumerate(records, 1):
            has_image = "🖼️" if record.get('imageUrl') else "📄"
            result.append(f"{i}. {has_image} **{record.get('title', '未命名')}**")
            
            details = []
            if record.get('recordType'):
                details.append(f"类型: {record['recordType']}")
            if record.get('hospital'):
                details.append(f"医院: {record['hospital']}")
            if record.get('recordDate'):
                details.append(f"日期: {record['recordDate']}")
            
            if details:
                result.append(f"   - {' | '.join(details)}")
            
            if record.get('description'):
                result.append(f"   - 描述: {record['description'][:50]}...")
            
            result.append("")
        
        return "\n".join(result)
    
    async def _view_latest_record(self, position: str = "latest") -> str:
        """查看并分析最近的病历图片"""
        if not self.image_analyzer:
            return "图片分析服务未初始化"
        
        if not self.medical_records:
            return "📋 您目前没有病历记录。请先在「病历管理」中上传检查报告、化验单等。"
        
        # 根据位置获取病历
        position_map = {"latest": 0, "second": 1, "third": 2}
        index = position_map.get(position, 0)
        
        if index >= len(self.medical_records):
            return f"📋 您只有 {len(self.medical_records)} 份病历，无法查看第 {index + 1} 份。"
        
        record = self.medical_records[index]
        title = record.get('title', '未命名')
        record_type = record.get('recordType', '病历')
        record_date = record.get('recordDate', '')
        
        # 获取图片 URL（支持多图片）
        images = record.get('images', [])
        image_url = record.get('imageUrl')
        
        if images and len(images) > 0:
            # 有多张图片，分析所有图片
            results = [f"📋 **{title}** ({record_type})" + (f" - {record_date}" if record_date else "")]
            results.append(f"共有 {len(images)} 张图片\n")
            
            for i, img in enumerate(images[:5], 1):  # 最多分析5张
                img_url = img.get('filePath')
                if img_url:
                    try:
                        prompt = f"请详细分析这张{record_type}图片，指出所有关键信息和指标。"
                        analysis = await self.image_analyzer(prompt, img_url, None)
                        results.append(f"### 图片 {i}\n{analysis}\n")
                    except Exception as e:
                        results.append(f"### 图片 {i}\n分析失败: {str(e)}\n")
            
            return "\n".join(results)
        elif image_url:
            # 单张图片
            try:
                prompt = f"请详细分析这张{record_type}图片，指出所有关键信息、检查指标、是否有异常，并给出解读和建议。"
                analysis = await self.image_analyzer(prompt, image_url, None)
                return f"📋 **{title}** ({record_type})" + (f" - {record_date}" if record_date else "") + f"\n\n{analysis}"
            except Exception as e:
                return f"分析失败: {str(e)}"
        else:
            return f"📋 **{title}** ({record_type}) 没有上传图片，无法分析内容。\n\n描述: {record.get('description', '无')}"
    
    async def _analyze_medical_image(self, record_id: int, analysis_focus: str = "") -> str:
        """分析指定病历的图片"""
        if not self.image_analyzer:
            return "图片分析服务未初始化"
        
        # 查找对应的病历
        record = None
        for r in self.medical_records:
            if r.get('id') == record_id:
                record = r
                break
        
        if not record:
            return f"未找到 ID 为 {record_id} 的病历记录"
        
        image_url = record.get('imageUrl')
        if not image_url:
            return f"病历「{record.get('title', '未命名')}」没有上传图片"
        
        # 调用图片分析
        prompt = f"请详细分析这张医疗图片（{record.get('recordType', '检查报告')}）"
        if analysis_focus:
            prompt += f"，重点关注：{analysis_focus}"
        
        result = await self.image_analyzer(prompt, image_url, None)
        
        return f"🔍 **{record.get('title', '病历')}** 分析结果：\n\n{result}"
    
    async def _analyze_all_images(self, max_count: int = 5) -> str:
        """分析所有病历图片"""
        if not self.image_analyzer:
            return "图片分析服务未初始化"
        
        # 筛选有图片的病历
        records_with_images = [r for r in self.medical_records if r.get('imageUrl')]
        
        if not records_with_images:
            return "📋 您的病历中没有可以分析的图片。请先在「病历管理」中上传检查报告、化验单等图片。"
        
        results = []
        analyzed_count = 0
        
        for record in records_with_images[:max_count]:
            image_url = record.get('imageUrl')
            title = record.get('title', '未命名')
            record_type = record.get('recordType', '检查报告')
            
            try:
                prompt = f"请简要分析这张{record_type}，指出关键指标和是否有异常。"
                analysis = await self.image_analyzer(prompt, image_url, None)
                results.append({
                    'title': title,
                    'type': record_type,
                    'date': record.get('recordDate', ''),
                    'analysis': analysis
                })
                analyzed_count += 1
            except Exception as e:
                results.append({
                    'title': title,
                    'type': record_type,
                    'analysis': f"分析失败: {str(e)}"
                })
        
        # 生成综合报告
        report = [f"📊 **病历综合分析报告**\n"]
        report.append(f"共分析了 {analyzed_count}/{len(records_with_images)} 份病历图片\n")
        report.append("---\n")
        
        for i, r in enumerate(results, 1):
            report.append(f"### {i}. {r['title']} ({r['type']})")
            if r.get('date'):
                report.append(f" - {r['date']}")
            report.append(f"\n{r['analysis']}\n")
        
        report.append("---\n")
        report.append("💡 **温馨提示**：以上分析仅供参考，如有异常请及时就医。")
        
        return "\n".join(report)
    
    def _get_user_profile(self) -> str:
        """获取用户档案"""
        if not self.user_profile:
            return "📋 您还没有填写健康档案。建议您在「个人档案」中完善健康信息，以便获得更精准的健康建议。"
        
        profile = self.user_profile
        result = ["👤 **您的健康档案**\n"]
        
        if profile.get('realName'):
            result.append(f"- 姓名: {profile['realName']}")
        if profile.get('gender'):
            gender_map = {"male": "男", "female": "女", "other": "其他"}
            result.append(f"- 性别: {gender_map.get(profile['gender'], profile['gender'])}")
        if profile.get('birthDate'):
            result.append(f"- 出生日期: {profile['birthDate']}")
        if profile.get('height'):
            result.append(f"- 身高: {profile['height']} cm")
        if profile.get('weight'):
            result.append(f"- 体重: {profile['weight']} kg")
        if profile.get('bloodType'):
            result.append(f"- 血型: {profile['bloodType']}")
        if profile.get('allergies'):
            result.append(f"- 过敏史: {profile['allergies']}")
        if profile.get('medicalHistory'):
            result.append(f"- 病史: {profile['medicalHistory']}")
        if profile.get('familyHistory'):
            result.append(f"- 家族病史: {profile['familyHistory']}")
        
        return "\n".join(result)
    
    def _calculate_health_metrics(self, metric_type: str) -> str:
        """计算健康指标"""
        height = self.user_profile.get('height')
        weight = self.user_profile.get('weight')
        gender = self.user_profile.get('gender')
        birth_date = self.user_profile.get('birthDate')
        
        results = ["📊 **健康指标计算**\n"]
        
        if metric_type in ['bmi', 'all']:
            if height and weight:
                height_m = height / 100
                bmi = weight / (height_m ** 2)
                
                if bmi < 18.5:
                    status = "偏瘦"
                elif bmi < 24:
                    status = "正常"
                elif bmi < 28:
                    status = "偏胖"
                else:
                    status = "肥胖"
                
                results.append(f"**BMI 指数**: {bmi:.1f} ({status})")
                results.append(f"  - 正常范围: 18.5 - 24")
            else:
                results.append("**BMI**: 需要身高和体重数据")
        
        if metric_type in ['ideal_weight', 'all']:
            if height:
                # 使用 BMI 22 作为理想体重标准
                height_m = height / 100
                ideal = 22 * (height_m ** 2)
                results.append(f"\n**理想体重**: {ideal:.1f} kg")
                if weight:
                    diff = weight - ideal
                    if diff > 0:
                        results.append(f"  - 建议减重: {diff:.1f} kg")
                    elif diff < -2:
                        results.append(f"  - 建议增重: {abs(diff):.1f} kg")
                    else:
                        results.append(f"  - 体重正常 ✓")
        
        if metric_type in ['daily_calories', 'all']:
            if height and weight and gender:
                # 基础代谢率 (Harris-Benedict 公式)
                if gender == 'male':
                    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * 30)  # 假设30岁
                else:
                    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * 30)
                
                # 轻度活动量 (系数 1.375)
                daily_cal = bmr * 1.375
                results.append(f"\n**每日建议热量**: {daily_cal:.0f} kcal")
                results.append(f"  - 基础代谢: {bmr:.0f} kcal")
                results.append(f"  - 活动系数: 轻度活动 (1.375)")
        
        if len(results) == 1:
            results.append("需要在个人档案中填写身高、体重等信息才能计算健康指标。")
        
        return "\n".join(results)
    
    def _provide_health_advice(self, advice_type: str) -> str:
        """提供健康建议"""
        advice = ["💡 **健康建议**\n"]
        
        # 根据用户档案定制建议
        weight = self.user_profile.get('weight')
        height = self.user_profile.get('height')
        allergies = self.user_profile.get('allergies', '')
        medical_history = self.user_profile.get('medicalHistory', '')
        
        if advice_type in ['diet', 'general']:
            advice.append("### 🥗 饮食建议")
            advice.append("- 每日蔬菜水果不少于 500g")
            advice.append("- 控制盐摄入，每日不超过 6g")
            advice.append("- 多喝水，每日 1500-2000ml")
            if height and weight:
                bmi = weight / ((height/100) ** 2)
                if bmi >= 24:
                    advice.append("- ⚠️ 注意控制热量摄入，减少高油高糖食物")
            if allergies:
                advice.append(f"- ⚠️ 注意避开过敏原: {allergies}")
            advice.append("")
        
        if advice_type in ['exercise', 'general']:
            advice.append("### 🏃 运动建议")
            advice.append("- 每周至少 150 分钟中等强度运动")
            advice.append("- 推荐：快走、游泳、骑车等有氧运动")
            advice.append("- 每周 2-3 次力量训练")
            if medical_history and ('心' in medical_history or '血压' in medical_history):
                advice.append("- ⚠️ 有心血管病史，运动前建议咨询医生")
            advice.append("")
        
        if advice_type in ['sleep', 'general']:
            advice.append("### 😴 睡眠建议")
            advice.append("- 保持规律作息，每晚 7-8 小时睡眠")
            advice.append("- 睡前 1 小时避免使用电子设备")
            advice.append("- 保持卧室安静、黑暗、凉爽")
            advice.append("")
        
        if advice_type in ['followup', 'general']:
            advice.append("### 🏥 复查建议")
            if self.medical_records:
                advice.append(f"- 您有 {len(self.medical_records)} 份病历记录")
                advice.append("- 建议每年进行一次全面体检")
                advice.append("- 异常指标应按医嘱定期复查")
            else:
                advice.append("- 建议每年进行一次全面体检")
                advice.append("- 上传病历记录以获得更精准的复查建议")
        
        advice.append("\n---")
        advice.append("*以上建议仅供参考，具体请遵医嘱*")
        
        return "\n".join(advice)
    
    def _analyze_symptoms(self, symptoms: str, duration: str = None, severity: str = None) -> str:
        """分析症状"""
        if not symptoms:
            return "请描述您的症状，我会帮您分析可能的原因。"
        
        result = [f"🩺 **症状分析**\n"]
        result.append(f"**您描述的症状**: {symptoms}")
        if duration:
            result.append(f"**持续时间**: {duration}")
        if severity:
            severity_map = {"mild": "轻微", "moderate": "中等", "severe": "严重"}
            result.append(f"**严重程度**: {severity_map.get(severity, severity)}")
        result.append("")
        
        # 常见症状分析知识库
        symptom_analysis = {
            "头疼": {
                "causes": ["紧张性头痛（最常见）", "偏头痛", "睡眠不足", "压力过大", "颈椎问题", "眼疲劳"],
                "suggestions": ["保证充足睡眠", "减少屏幕使用时间", "适当休息放松", "注意颈椎姿势"],
                "warning": "如果头痛剧烈、突发、伴有发热或视力变化，请立即就医"
            },
            "头晕": {
                "causes": ["低血糖", "低血压", "贫血", "内耳问题", "颈椎问题", "睡眠不足"],
                "suggestions": ["起身时动作缓慢", "保持规律饮食", "检查血压和血糖"],
                "warning": "如果头晕伴有胸闷、心悸或肢体麻木，请立即就医"
            },
            "疲劳": {
                "causes": ["睡眠不足", "缺乏运动", "营养不良", "贫血", "甲状腺功能异常", "慢性疲劳综合征"],
                "suggestions": ["保证7-8小时睡眠", "适当运动", "均衡饮食", "检查血常规和甲状腺功能"],
                "warning": "如果长期疲劳超过6个月，建议进行全面检查"
            },
            "失眠": {
                "causes": ["压力焦虑", "不良睡眠习惯", "咖啡因摄入", "环境因素", "生物钟紊乱"],
                "suggestions": ["固定作息时间", "睡前避免使用手机", "减少咖啡茶的摄入", "保持卧室安静黑暗"],
                "warning": "如果失眠持续超过1个月，建议就医"
            },
            "胃痛": {
                "causes": ["饮食不规律", "胃炎", "胃溃疡", "消化不良", "压力性胃痛"],
                "suggestions": ["规律饮食", "少食多餐", "避免辛辣刺激", "戒烟限酒"],
                "warning": "如果胃痛剧烈、伴有黑便或呕血，请立即就医"
            },
            "咳嗽": {
                "causes": ["感冒", "过敏", "支气管炎", "咽炎", "空气干燥"],
                "suggestions": ["多喝温水", "保持空气湿润", "避免刺激性气味"],
                "warning": "如果咳嗽超过2周或咳血，请及时就医"
            }
        }
        
        # 匹配症状
        matched = None
        for key in symptom_analysis:
            if key in symptoms:
                matched = symptom_analysis[key]
                break
        
        if matched:
            result.append("### 可能的原因")
            for cause in matched["causes"]:
                result.append(f"- {cause}")
            result.append("")
            result.append("### 建议措施")
            for sug in matched["suggestions"]:
                result.append(f"- {sug}")
            result.append("")
            result.append(f"### ⚠️ 就医提醒")
            result.append(matched["warning"])
        else:
            result.append("### 建议")
            result.append("- 注意观察症状变化")
            result.append("- 保持良好的作息和饮食习惯")
            result.append("- 如果症状持续或加重，建议就医检查")
        
        result.append("\n---")
        result.append("*以上分析仅供参考，不能替代医生诊断*")
        
        return "\n".join(result)
    
    def _search_drug_info(self, drug_name: str, info_type: str = "all") -> str:
        """查询药物信息"""
        if not drug_name:
            return "请提供药物名称。"
        
        # 常见药物信息库
        drug_database = {
            "阿莫西林": {
                "name": "阿莫西林",
                "type": "抗生素（青霉素类）",
                "usage": "口服，一次0.5g，每6-8小时一次，或遵医嘱",
                "indications": "敏感菌引起的呼吸道感染、尿路感染、皮肤软组织感染等",
                "side_effects": ["恶心、呕吐、腹泻", "皮疹", "过敏反应（严重时可致过敏性休克）"],
                "contraindications": ["对青霉素过敏者禁用", "传染性单核细胞增多症患者"],
                "interactions": ["与丙磺舒合用可增加血药浓度", "避免与四环素类同服"]
            },
            "布洛芬": {
                "name": "布洛芬",
                "type": "非甾体抗炎药",
                "usage": "口服，一次0.2-0.4g，每4-6小时一次，24小时不超过2.4g",
                "indications": "发热、头痛、牙痛、关节痛、痛经等",
                "side_effects": ["胃肠道不适", "头晕", "皮疹"],
                "contraindications": ["胃溃疡患者慎用", "肾功能不全者慎用", "孕晚期禁用"],
                "interactions": ["避免与阿司匹林同服", "与降压药合用可能降低降压效果"]
            },
            "对乙酰氨基酚": {
                "name": "对乙酰氨基酚（扑热息痛）",
                "type": "解热镇痛药",
                "usage": "口服，一次0.3-0.6g，每4-6小时一次，24小时不超过2g",
                "indications": "发热、头痛、关节痛、神经痛等",
                "side_effects": ["偶见皮疹、恶心", "大剂量可致肝损害"],
                "contraindications": ["严重肝肾功能不全者禁用", "对本品过敏者禁用"],
                "interactions": ["避免与酒精同用", "与抗凝药合用需注意"]
            },
            "维生素C": {
                "name": "维生素C",
                "type": "维生素类",
                "usage": "口服，一次0.1-0.2g，一日3次",
                "indications": "预防坏血病、增强免疫力、促进铁吸收",
                "side_effects": ["大量服用可能引起胃酸过多", "可能影响某些检验结果"],
                "contraindications": ["草酸盐尿症、尿酸盐性肾结石患者慎用"],
                "interactions": ["与阿司匹林同服可增加维生素C排泄"]
            }
        }
        
        # 查找药物
        drug_info = None
        for key in drug_database:
            if key in drug_name or drug_name in key:
                drug_info = drug_database[key]
                break
        
        if not drug_info:
            return f"💊 抱歉，暂未收录「{drug_name}」的详细信息。建议：\n- 查阅药品说明书\n- 咨询医生或药师\n- 不要自行用药"
        
        result = [f"💊 **{drug_info['name']}**\n"]
        result.append(f"**类别**: {drug_info['type']}")
        result.append("")
        
        if info_type in ['usage', 'all']:
            result.append("### 用法用量")
            result.append(f"{drug_info['usage']}")
            result.append(f"\n**适应症**: {drug_info['indications']}")
            result.append("")
        
        if info_type in ['side_effects', 'all']:
            result.append("### 不良反应")
            for se in drug_info['side_effects']:
                result.append(f"- {se}")
            result.append("")
        
        if info_type in ['contraindications', 'all']:
            result.append("### 禁忌与注意")
            for ci in drug_info['contraindications']:
                result.append(f"- {ci}")
            result.append("")
        
        if info_type in ['interactions', 'all']:
            result.append("### 药物相互作用")
            for inter in drug_info['interactions']:
                result.append(f"- {inter}")
        
        result.append("\n---")
        result.append("*请遵医嘱用药，如有不适立即停药并就医*")
        
        return "\n".join(result)
    
    def _record_health_data(self, data_type: str, value: str, note: str = None) -> str:
        """记录健康数据（模拟）"""
        if not data_type or not value:
            return "请提供数据类型和数值。"
        
        type_names = {
            "weight": "体重",
            "blood_pressure": "血压",
            "blood_sugar": "血糖",
            "heart_rate": "心率",
            "temperature": "体温",
            "sleep": "睡眠",
            "exercise": "运动",
            "diet": "饮食"
        }
        
        type_name = type_names.get(data_type, data_type)
        
        # 模拟记录成功（实际需要调用后端 API）
        result = [f"✅ **健康数据已记录**\n"]
        result.append(f"- **类型**: {type_name}")
        result.append(f"- **数值**: {value}")
        result.append(f"- **时间**: {self._get_current_time()}")
        if note:
            result.append(f"- **备注**: {note}")
        
        # 给出简单分析
        if data_type == "weight":
            result.append("\n💡 **小贴士**: 建议每天同一时间测量体重，以获得更准确的趋势数据。")
        elif data_type == "blood_pressure":
            result.append("\n💡 **小贴士**: 正常血压范围为 90-140/60-90 mmHg。测量前请休息5分钟。")
        elif data_type == "blood_sugar":
            result.append("\n💡 **小贴士**: 空腹血糖正常值 3.9-6.1 mmol/L，餐后2小时 < 7.8 mmol/L。")
        
        result.append("\n---")
        result.append("*健康数据记录功能需要后端支持，此为演示效果*")
        
        return "\n".join(result)
    
    def _get_current_time(self) -> str:
        """获取当前时间"""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M")
    
    def _get_health_trend(self, data_type: str, days: int = 30) -> str:
        """获取健康趋势（模拟）"""
        type_names = {
            "weight": "体重",
            "blood_pressure": "血压",
            "blood_sugar": "血糖",
            "heart_rate": "心率",
            "all": "综合健康"
        }
        
        type_name = type_names.get(data_type, data_type)
        
        result = [f"📊 **{type_name}趋势分析** (最近{days}天)\n"]
        
        # 模拟数据（实际需要从后端获取）
        result.append("---")
        result.append("*健康趋势功能需要足够的历史数据。请先记录您的健康数据。*")
        result.append("")
        result.append("**建议**:")
        result.append("- 定期记录健康数据（体重、血压等）")
        result.append("- 至少记录7天数据后可查看趋势")
        result.append("- 趋势图表将在前端页面展示")
        
        return "\n".join(result)
    
    def _set_health_reminder(self, reminder_type: str, content: str, time: str = None) -> str:
        """设置健康提醒（模拟）"""
        type_names = {
            "medication": "💊 吃药提醒",
            "checkup": "🏥 复查提醒",
            "exercise": "🏃 运动提醒",
            "water": "💧 喝水提醒",
            "custom": "📝 自定义提醒"
        }
        
        type_name = type_names.get(reminder_type, "📝 提醒")
        
        result = [f"✅ **提醒已设置**\n"]
        result.append(f"- **类型**: {type_name}")
        result.append(f"- **内容**: {content}")
        if time:
            result.append(f"- **时间**: {time}")
        else:
            result.append(f"- **时间**: 待设置")
        
        result.append("\n---")
        result.append("*提醒功能需要后端和推送服务支持，此为演示效果*")
        result.append("*实际提醒将通过 APP 推送或短信发送*")
        
        return "\n".join(result)
    
    def _recommend_department(self, symptoms: str) -> str:
        """推荐就诊科室"""
        if not symptoms:
            return "请描述您的症状，我会推荐合适的就诊科室。"
        
        # 科室推荐知识库
        department_map = {
            ("头疼", "头痛", "头晕", "偏头痛"): ("神经内科", "如伴有视力问题可先看眼科"),
            ("发烧", "发热", "感冒", "咳嗽", "流涕"): ("呼吸内科", "普通感冒也可看全科/内科"),
            ("胃痛", "胃胀", "恶心", "呕吐", "腹泻"): ("消化内科", "如有明显腹痛可先看急诊"),
            ("胸闷", "心悸", "心慌", "胸痛"): ("心内科", "⚠️ 如胸痛剧烈请立即急诊"),
            ("关节痛", "腰痛", "颈椎", "骨折"): ("骨科", "如伴有麻木可看神经内科"),
            ("皮肤", "皮疹", "湿疹", "过敏"): ("皮肤科", ""),
            ("眼睛", "视力", "眼痛", "红眼"): ("眼科", ""),
            ("耳朵", "耳鸣", "听力", "鼻子", "咽喉"): ("耳鼻喉科", ""),
            ("牙痛", "牙龈", "口腔"): ("口腔科", ""),
            ("月经", "妇科", "怀孕", "产检"): ("妇产科", ""),
            ("小儿", "儿童", "宝宝"): ("儿科", ""),
            ("焦虑", "抑郁", "失眠", "情绪"): ("精神科/心理科", "也可先看神经内科"),
            ("尿频", "尿痛", "肾", "泌尿"): ("泌尿外科", "女性也可看妇科"),
            ("血糖", "糖尿病", "甲状腺"): ("内分泌科", ""),
        }
        
        result = [f"🏥 **就诊科室推荐**\n"]
        result.append(f"**您的症状**: {symptoms}")
        result.append("")
        
        recommended = None
        for keywords, dept_info in department_map.items():
            if any(kw in symptoms for kw in keywords):
                recommended = dept_info
                break
        
        if recommended:
            result.append(f"### 推荐科室: {recommended[0]}")
            if recommended[1]:
                result.append(f"💡 {recommended[1]}")
        else:
            result.append("### 推荐科室: 全科/内科")
            result.append("💡 全科医生会根据您的情况进行初步诊断并转诊")
        
        result.append("")
        result.append("### 就诊建议")
        result.append("- 带上近期的检查报告和病历")
        result.append("- 提前整理好症状描述（何时开始、严重程度等）")
        result.append("- 告知医生正在服用的药物")
        result.append("- 如有药物过敏史请提前说明")
        
        result.append("\n---")
        result.append("*以上推荐仅供参考，如有疑问可先咨询医院导诊台*")
        
        return "\n".join(result)
    
    def _get_medical_record_stats(self, stat_type: str = "summary") -> str:
        """获取病历统计信息"""
        if not self.medical_records:
            return "📊 您目前没有病历记录。上传病历后可以查看统计信息。"
        
        result = ["📊 **病历统计报告**\n"]
        
        # 基础统计
        total = len(self.medical_records)
        types = {}
        hospitals = {}
        years = {}
        
        for r in self.medical_records:
            # 按类型统计
            rtype = r.get('recordType', '其他')
            types[rtype] = types.get(rtype, 0) + 1
            
            # 按医院统计
            hospital = r.get('hospital', '未知医院')
            if hospital:
                hospitals[hospital] = hospitals.get(hospital, 0) + 1
            
            # 按年份统计
            date = r.get('recordDate', '')
            if date and len(date) >= 4:
                year = date[:4]
                years[year] = years.get(year, 0) + 1
        
        if stat_type in ['summary', 'all']:
            result.append(f"### 📋 总览")
            result.append(f"- 病历总数：**{total}** 份")
            result.append(f"- 病历类型：**{len(types)}** 种")
            result.append(f"- 就诊医院：**{len(hospitals)}** 家")
            result.append(f"- 时间跨度：**{len(years)}** 年")
            result.append("")
        
        if stat_type in ['by_type', 'all']:
            result.append("### 📁 按类型分布")
            for t, count in sorted(types.items(), key=lambda x: x[1], reverse=True):
                pct = count / total * 100
                bar = "█" * int(pct / 10) + "░" * (10 - int(pct / 10))
                result.append(f"- {t}: {count}份 {bar} {pct:.0f}%")
            result.append("")
        
        if stat_type in ['by_hospital', 'all']:
            result.append("### 🏥 按医院分布")
            for h, count in sorted(hospitals.items(), key=lambda x: x[1], reverse=True):
                result.append(f"- {h}: {count}次")
            result.append("")
        
        if stat_type in ['by_year', 'all']:
            result.append("### 📅 按年份分布")
            for y, count in sorted(years.items(), reverse=True):
                result.append(f"- {y}年: {count}份")
            result.append("")
        
        return "\n".join(result)
    
    async def _compare_medical_records(self, record_type: str = None, 
                                       record_id_1: int = None, 
                                       record_id_2: int = None) -> str:
        """对比两份病历"""
        if not self.medical_records:
            return "📊 您目前没有病历记录，无法进行对比分析。"
        
        # 如果指定了 ID，使用指定的病历
        if record_id_1 and record_id_2:
            record1 = next((r for r in self.medical_records if r.get('id') == record_id_1), None)
            record2 = next((r for r in self.medical_records if r.get('id') == record_id_2), None)
            if not record1 or not record2:
                return "未找到指定的病历记录。"
        else:
            # 自动查找同类型的病历
            filtered = self.medical_records
            if record_type:
                filtered = [r for r in self.medical_records 
                           if record_type.lower() in (r.get('recordType', '') or '').lower()]
            
            if len(filtered) < 2:
                return f"📊 需要至少两份{'类型为「' + record_type + '」的' if record_type else ''}病历才能进行对比分析。"
            
            # 按日期排序，取最近两份
            sorted_records = sorted(filtered, 
                                   key=lambda x: x.get('recordDate', ''), 
                                   reverse=True)
            record2 = sorted_records[0]  # 较新的
            record1 = sorted_records[1]  # 较早的
        
        result = [f"📊 **病历对比分析**\n"]
        
        # 显示对比的病历信息
        result.append("### 对比病历")
        result.append(f"📄 **较早记录**: {record1.get('title', '未命名')}")
        result.append(f"   - 日期: {record1.get('recordDate', '未知')}")
        result.append(f"   - 医院: {record1.get('hospital', '未知')}")
        result.append("")
        result.append(f"📄 **较新记录**: {record2.get('title', '未命名')}")
        result.append(f"   - 日期: {record2.get('recordDate', '未知')}")
        result.append(f"   - 医院: {record2.get('hospital', '未知')}")
        result.append("")
        
        # 如果有图片，尝试分析对比
        if self.image_analyzer:
            img1 = record1.get('imageUrl') or (record1.get('images', [{}])[0].get('filePath') if record1.get('images') else None)
            img2 = record2.get('imageUrl') or (record2.get('images', [{}])[0].get('filePath') if record2.get('images') else None)
            
            if img1 and img2:
                result.append("### 🔍 AI 对比分析")
                try:
                    # 分析两张图片
                    prompt1 = "请简要提取这张医疗报告中的关键指标和数值，用列表形式展示。"
                    prompt2 = "请简要提取这张医疗报告中的关键指标和数值，用列表形式展示。"
                    
                    analysis1 = await self.image_analyzer(prompt1, img1, None)
                    analysis2 = await self.image_analyzer(prompt2, img2, None)
                    
                    result.append(f"**{record1.get('recordDate', '较早')} 的关键指标:**")
                    result.append(analysis1)
                    result.append("")
                    result.append(f"**{record2.get('recordDate', '较新')} 的关键指标:**")
                    result.append(analysis2)
                    result.append("")
                    result.append("---")
                    result.append("💡 **温馨提示**: 请结合医生意见解读指标变化。")
                except Exception as e:
                    result.append(f"图片分析失败: {str(e)}")
            else:
                result.append("### 📝 描述对比")
                result.append(f"**较早记录描述**: {record1.get('description', '无')}")
                result.append(f"**较新记录描述**: {record2.get('description', '无')}")
        else:
            result.append("### 📝 描述对比")
            result.append(f"**较早记录描述**: {record1.get('description', '无')}")
            result.append(f"**较新记录描述**: {record2.get('description', '无')}")
        
        return "\n".join(result)
    
    async def _generate_health_summary(self, include_recommendations: bool = True,
                                       time_range: str = "all") -> str:
        """生成健康摘要报告"""
        result = ["📋 **个人健康摘要报告**\n"]
        result.append(f"*生成时间: {self._get_current_time()}*\n")
        result.append("---\n")
        
        # 用户档案摘要
        result.append("### 👤 基本信息")
        if self.user_profile:
            profile = self.user_profile
            if profile.get('realName'):
                result.append(f"- 姓名: {profile['realName']}")
            if profile.get('gender'):
                gender_map = {"male": "男", "female": "女"}
                result.append(f"- 性别: {gender_map.get(profile['gender'], profile['gender'])}")
            if profile.get('height') and profile.get('weight'):
                bmi = profile['weight'] / ((profile['height']/100) ** 2)
                result.append(f"- 身高体重: {profile['height']}cm / {profile['weight']}kg (BMI: {bmi:.1f})")
            if profile.get('bloodType'):
                result.append(f"- 血型: {profile['bloodType']}")
            if profile.get('allergies'):
                result.append(f"- ⚠️ 过敏史: {profile['allergies']}")
            if profile.get('medicalHistory'):
                result.append(f"- 既往病史: {profile['medicalHistory']}")
        else:
            result.append("*您还没有完善健康档案*")
        result.append("")
        
        # 病历记录摘要
        result.append("### 📄 病历记录概览")
        if self.medical_records:
            # 时间筛选
            records = self.medical_records
            if time_range == "recent":
                records = records[:5]
            elif time_range == "half_year":
                from datetime import datetime, timedelta
                cutoff = (datetime.now() - timedelta(days=180)).strftime("%Y-%m-%d")
                records = [r for r in records if (r.get('recordDate', '') or '0') >= cutoff]
            elif time_range == "one_year":
                from datetime import datetime, timedelta
                cutoff = (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d")
                records = [r for r in records if (r.get('recordDate', '') or '0') >= cutoff]
            
            result.append(f"- 病历总数: {len(records)} 份")
            
            # 类型分布
            types = {}
            for r in records:
                t = r.get('recordType', '其他')
                types[t] = types.get(t, 0) + 1
            result.append(f"- 类型分布: {', '.join([f'{t}({c})' for t, c in types.items()])}")
            
            # 最近记录
            if records:
                latest = records[0]
                result.append(f"- 最近记录: {latest.get('title', '未命名')} ({latest.get('recordDate', '日期未知')})")
            
            # 如果有图片，进行综合分析
            if self.image_analyzer:
                records_with_images = [r for r in records[:3] if r.get('imageUrl') or r.get('images')]
                if records_with_images:
                    result.append("")
                    result.append("### 🔬 关键发现")
                    for r in records_with_images:
                        img_url = r.get('imageUrl') or (r.get('images', [{}])[0].get('filePath') if r.get('images') else None)
                        if img_url:
                            try:
                                prompt = "请用一句话总结这份医疗报告的关键发现，只说最重要的1-2点。"
                                analysis = await self.image_analyzer(prompt, img_url, None)
                                result.append(f"- **{r.get('title', '病历')}**: {analysis}")
                            except:
                                pass
        else:
            result.append("*您还没有上传病历记录*")
        result.append("")
        
        # 健康建议
        if include_recommendations:
            result.append("### 💡 健康建议")
            
            if self.user_profile:
                height = self.user_profile.get('height')
                weight = self.user_profile.get('weight')
                if height and weight:
                    bmi = weight / ((height/100) ** 2)
                    if bmi >= 24:
                        result.append("- 🔴 BMI偏高，建议控制饮食、增加运动")
                    elif bmi < 18.5:
                        result.append("- 🟡 BMI偏低，建议增加营养摄入")
                    else:
                        result.append("- 🟢 BMI正常，继续保持")
                
                if self.user_profile.get('allergies'):
                    result.append(f"- ⚠️ 注意避开过敏原: {self.user_profile['allergies']}")
            
            result.append("- 📅 建议每年进行一次全面体检")
            result.append("- 🏥 异常指标应按医嘱定期复查")
            result.append("- 💊 用药请遵医嘱，不要自行增减药量")
        
        result.append("\n---")
        result.append("*以上报告由 AI 生成，仅供参考，具体请遵医嘱*")
        
        return "\n".join(result)
    
    def _suggest_followup(self, record_type: str = None) -> str:
        """建议复查计划"""
        result = ["🏥 **复查建议**\n"]
        
        if not self.medical_records:
            result.append("您目前没有病历记录。建议：")
            result.append("- 每年进行一次全面体检")
            result.append("- 上传病历记录后可获得个性化复查建议")
            return "\n".join(result)
        
        # 复查建议规则
        followup_rules = {
            "检查报告": {"interval_days": 365, "name": "年度体检"},
            "化验单": {"interval_days": 90, "name": "血液检查"},
            "CT/MRI": {"interval_days": 180, "name": "影像复查"},
            "X光片": {"interval_days": 180, "name": "影像复查"},
            "处方": {"interval_days": 30, "name": "药物复查"},
            "病历": {"interval_days": 90, "name": "病情复查"},
        }
        
        from datetime import datetime, timedelta
        today = datetime.now()
        
        # 分析每种类型的最后检查时间
        last_check = {}
        for r in self.medical_records:
            rtype = r.get('recordType', '其他')
            date = r.get('recordDate', '')
            if record_type and record_type.lower() not in rtype.lower():
                continue
            if date and (rtype not in last_check or date > last_check[rtype]):
                last_check[rtype] = date
        
        # 生成建议
        suggestions = []
        for rtype, last_date in last_check.items():
            rule = followup_rules.get(rtype, {"interval_days": 180, "name": "定期复查"})
            try:
                last_dt = datetime.strptime(last_date, "%Y-%m-%d")
                next_dt = last_dt + timedelta(days=rule["interval_days"])
                days_until = (next_dt - today).days
                
                if days_until < 0:
                    status = f"⚠️ 已过期 {abs(days_until)} 天"
                    urgency = 3
                elif days_until < 30:
                    status = f"🟡 还有 {days_until} 天"
                    urgency = 2
                else:
                    status = f"🟢 还有 {days_until} 天"
                    urgency = 1
                
                suggestions.append({
                    "type": rtype,
                    "last_date": last_date,
                    "next_date": next_dt.strftime("%Y-%m-%d"),
                    "status": status,
                    "urgency": urgency,
                    "name": rule["name"]
                })
            except:
                pass
        
        # 按紧急程度排序
        suggestions.sort(key=lambda x: (-x["urgency"], x["next_date"]))
        
        if suggestions:
            result.append("### 📅 复查计划")
            result.append("")
            for s in suggestions:
                result.append(f"**{s['type']}** ({s['name']})")
                result.append(f"- 上次检查: {s['last_date']}")
                result.append(f"- 建议复查: {s['next_date']} {s['status']}")
                result.append("")
        else:
            result.append("暂无需要复查的项目。")
        
        result.append("### 💡 温馨提示")
        result.append("- 复查建议仅供参考，具体请遵医嘱")
        result.append("- 如有不适症状，请及时就医")
        result.append("- 慢性病患者应按医生要求定期复查")
        
        return "\n".join(result)
    
    def _search_medical_records(self, keyword: str = None, hospital: str = None,
                                record_type: str = None, year: str = None) -> str:
        """搜索病历记录"""
        if not self.medical_records:
            return "📋 您目前没有病历记录。"
        
        results = self.medical_records.copy()
        
        # 应用筛选条件
        if keyword:
            keyword = keyword.lower()
            results = [r for r in results if 
                      keyword in (r.get('title', '') or '').lower() or
                      keyword in (r.get('description', '') or '').lower() or
                      keyword in (r.get('doctor', '') or '').lower()]
        
        if hospital:
            hospital = hospital.lower()
            results = [r for r in results if 
                      hospital in (r.get('hospital', '') or '').lower()]
        
        if record_type:
            record_type = record_type.lower()
            results = [r for r in results if 
                      record_type in (r.get('recordType', '') or '').lower()]
        
        if year:
            results = [r for r in results if 
                      (r.get('recordDate', '') or '').startswith(year)]
        
        # 构建搜索条件描述
        conditions = []
        if keyword:
            conditions.append(f"关键词「{keyword}」")
        if hospital:
            conditions.append(f"医院「{hospital}」")
        if record_type:
            conditions.append(f"类型「{record_type}」")
        if year:
            conditions.append(f"{year}年")
        
        condition_str = "、".join(conditions) if conditions else "所有"
        
        result = [f"🔍 **病历搜索结果**\n"]
        result.append(f"搜索条件: {condition_str}")
        result.append(f"找到 **{len(results)}** 条记录\n")
        
        if results:
            result.append("---")
            for i, r in enumerate(results, 1):
                has_image = "🖼️" if r.get('imageUrl') or r.get('images') else "📄"
                result.append(f"\n{i}. {has_image} **{r.get('title', '未命名')}** (ID: {r.get('id', '?')})")
                
                details = []
                if r.get('recordType'):
                    details.append(f"类型: {r['recordType']}")
                if r.get('hospital'):
                    details.append(f"医院: {r['hospital']}")
                if r.get('recordDate'):
                    details.append(f"日期: {r['recordDate']}")
                
                if details:
                    result.append(f"   {' | '.join(details)}")
        else:
            result.append("\n未找到符合条件的病历。")
            result.append("\n💡 **建议**:")
            result.append("- 尝试使用更宽泛的搜索条件")
            result.append("- 检查关键词是否正确")
        
        return "\n".join(result)

