# LambdaQueryWrapper 使用指南

本项目使用 MyBatis Plus 的 `LambdaQueryWrapper` 进行数据库查询，避免在 Java 代码中直接编写 SQL。

## 为什么使用 LambdaQueryWrapper？

1. **类型安全**：使用 Lambda 表达式引用字段，编译时检查，避免字符串拼写错误
2. **重构友好**：字段名修改时，IDE 可以自动重构
3. **代码简洁**：链式调用，代码清晰易读
4. **防止 SQL 注入**：自动参数化查询

## 基本用法示例

### 1. 简单等值查询

```java
// 查询用户名为 "zhangsan" 的用户
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getUsername, "zhangsan");
User user = userMapper.selectOne(wrapper);
```

### 2. 多条件查询（AND）

```java
// 查询指定用户的指定类型健康数据
LambdaQueryWrapper<HealthData> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(HealthData::getUserId, userId)
       .eq(HealthData::getDataType, dataType);
List<HealthData> list = healthDataMapper.selectList(wrapper);
```

### 3. OR 条件查询

```java
// 支持用户名或邮箱登录
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getUsername, usernameOrEmail)
       .or()
       .eq(User::getEmail, usernameOrEmail);
User user = userMapper.selectOne(wrapper);
```

### 4. 范围查询

```java
// 查询日期范围内的数据
LocalDate startDate = LocalDate.now().minusDays(7);
LocalDate endDate = LocalDate.now();

LambdaQueryWrapper<HealthData> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(HealthData::getUserId, userId)
       .between(HealthData::getRecordDate, startDate, endDate);
List<HealthData> list = healthDataMapper.selectList(wrapper);
```

### 5. 模糊查询

```java
// 模糊搜索病历标题
LambdaQueryWrapper<MedicalRecord> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(MedicalRecord::getUserId, userId)
       .like(MedicalRecord::getTitle, keyword);
List<MedicalRecord> list = medicalRecordMapper.selectList(wrapper);
```

### 6. 排序

```java
// 按日期降序排序
LambdaQueryWrapper<HealthData> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(HealthData::getUserId, userId)
       .orderByDesc(HealthData::getRecordDate);
List<HealthData> list = healthDataMapper.selectList(wrapper);
```

### 7. 限制查询数量

```java
// 查询最近 30 条记录
LambdaQueryWrapper<HealthData> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(HealthData::getUserId, userId)
       .eq(HealthData::getDataType, dataType)
       .orderByDesc(HealthData::getRecordDate)
       .last("LIMIT 30");
List<HealthData> list = healthDataMapper.selectList(wrapper);
```

### 8. 统计数量

```java
// 检查用户名是否存在
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getUsername, username);
Long count = userMapper.selectCount(wrapper);
boolean exists = count > 0;
```

### 9. IN 查询

```java
// 查询多个状态的提醒
List<String> types = Arrays.asList("medication", "checkup", "exercise");
LambdaQueryWrapper<HealthReminder> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(HealthReminder::getUserId, userId)
       .in(HealthReminder::getReminderType, types);
List<HealthReminder> list = healthReminderMapper.selectList(wrapper);
```

### 10. NULL 值查询

```java
// 查询没有结束日期的用药记录（正在服用）
LambdaQueryWrapper<MedicationRecord> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(MedicationRecord::getUserId, userId)
       .isNull(MedicationRecord::getEndDate);
List<MedicationRecord> list = medicationRecordMapper.selectList(wrapper);
```

## 实际应用示例

### 示例1：AuthService 用户注册

```java
@Transactional
public AuthResponse register(RegisterRequest request) {
    // 检查用户名是否已存在
    LambdaQueryWrapper<User> usernameQuery = new LambdaQueryWrapper<>();
    usernameQuery.eq(User::getUsername, request.getUsername());
    if (userMapper.selectCount(usernameQuery) > 0) {
        throw new RuntimeException("用户名已存在");
    }
    
    // 检查邮箱是否已存在
    LambdaQueryWrapper<User> emailQuery = new LambdaQueryWrapper<>();
    emailQuery.eq(User::getEmail, request.getEmail());
    if (userMapper.selectCount(emailQuery) > 0) {
        throw new RuntimeException("邮箱已被注册");
    }
    
    // ... 创建用户逻辑
}
```

### 示例2：HealthDataService 获取趋势数据

```java
@Transactional(readOnly = true)
public List<HealthData> getTrend(Long userId, String dataType, int days) {
    LocalDate endDate = LocalDate.now();
    LocalDate startDate = endDate.minusDays(days);
    
    LambdaQueryWrapper<HealthData> wrapper = new LambdaQueryWrapper<>();
    wrapper.eq(HealthData::getUserId, userId)
           .eq(HealthData::getDataType, dataType)
           .between(HealthData::getRecordDate, startDate, endDate)
           .orderByAsc(HealthData::getRecordDate);
    
    return healthDataMapper.selectList(wrapper);
}
```

### 示例3：ChatService 查询会话历史

```java
@Transactional(readOnly = true)
public List<ChatHistory> getChatHistory(Long userId, String sessionId) {
    LambdaQueryWrapper<ChatHistory> wrapper = new LambdaQueryWrapper<>();
    wrapper.eq(ChatHistory::getUserId, userId)
           .eq(ChatHistory::getSessionId, sessionId)
           .orderByAsc(ChatHistory::getCreatedAt);
    
    return chatHistoryMapper.selectList(wrapper);
}
```

## 复杂查询使用 XML

对于某些复杂查询（如 DISTINCT、GROUP BY、子查询等），使用 XML 文件更合适。

### 示例：ChatHistoryMapper.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" 
    "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.health.mapper.ChatHistoryMapper">
    
    <select id="findDistinctSessionIdsByUserId" resultType="java.lang.String">
        SELECT DISTINCT session_id 
        FROM chat_histories 
        WHERE user_id = #{userId} 
        ORDER BY session_id DESC
    </select>
    
</mapper>
```

对应的 Mapper 接口：

```java
@Mapper
public interface ChatHistoryMapper extends BaseMapper<ChatHistory> {
    
    /**
     * 获取用户的所有不同会话ID
     */
    List<String> findDistinctSessionIdsByUserId(Long userId);
}
```

## 常用方法对照表

| 功能 | LambdaQueryWrapper 方法 |
|------|------------------------|
| 等于 | `eq(字段, 值)` |
| 不等于 | `ne(字段, 值)` |
| 大于 | `gt(字段, 值)` |
| 大于等于 | `ge(字段, 值)` |
| 小于 | `lt(字段, 值)` |
| 小于等于 | `le(字段, 值)` |
| BETWEEN | `between(字段, 值1, 值2)` |
| LIKE | `like(字段, 值)` |
| LEFT LIKE | `likeLeft(字段, 值)` |
| RIGHT LIKE | `likeRight(字段, 值)` |
| IS NULL | `isNull(字段)` |
| IS NOT NULL | `isNotNull(字段)` |
| IN | `in(字段, 集合)` |
| NOT IN | `notIn(字段, 集合)` |
| 升序排序 | `orderByAsc(字段)` |
| 降序排序 | `orderByDesc(字段)` |
| 分组 | `groupBy(字段)` |

## 最佳实践

1. **每个查询创建新的 Wrapper 实例**，避免状态混乱
2. **优先使用 LambdaQueryWrapper**，而不是字符串字段名
3. **复杂查询使用 XML**，保持代码清晰
4. **注意 OR 条件**需要显式调用 `.or()`
5. **使用 `selectOne()` 时**确保查询结果唯一，否则会抛出异常
6. **分页查询**使用 MyBatis Plus 的 `Page` 对象

## Service 层迁移清单

以下 Service 需要按照上述方式更新：

- ✅ `AuthService.java` - 已更新
- ✅ `HealthDataService.java` - 已更新
- ⚠️ `ChatService.java` - 待更新
- ⚠️ `MedicationService.java` - 待更新
- ⚠️ `LifeRecordService.java` - 待更新
- ⚠️ `ReminderService.java` - 待更新
- ⚠️ `MedicalRecordService.java` - 待更新
- ⚠️ `ProfileService.java` - 待更新

## 参考资料

- [MyBatis Plus LambdaQueryWrapper 官方文档](https://baomidou.com/pages/10c804/#lambdaquerywrapper)
- [条件构造器详解](https://baomidou.com/pages/10c804/)

