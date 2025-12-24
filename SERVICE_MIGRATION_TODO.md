# Service 层迁移待办

## ⚠️ 重要提示

已删除 `com.health.repository` 包下的所有Repository文件。以下Service文件需要完成从Repository到Mapper的迁移。

## 待完成的Service（4个）

### 1. ChatService.java ⚠️
需要替换的Repository:
- `ChatHistoryRepository` → `ChatHistoryMapper`
- `UserRepository` → `UserMapper`
- `UserProfileRepository` → `UserProfileMapper`
- `MedicalRecordRepository` → `MedicalRecordMapper`

关键方法迁移：
- `findByUserIdAndSessionIdOrderByCreatedAtAsc` → 使用 `LambdaQueryWrapper`
- `findSessionsSummary` → 已在 ChatHistoryMapper.xml 中定义

### 2. MedicalRecordService.java ⚠️
需要替换的Repository:
- `MedicalRecordRepository` → `MedicalRecordMapper`
- `MedicalRecordImageRepository` → `MedicalRecordImageMapper`
- `UserRepository` → `UserMapper`

关键方法迁移：
- `findByUserIdOrderByCreatedAtDesc` → 使用 `LambdaQueryWrapper.orderByDesc(MedicalRecord::getCreatedAt)`
- `findByRecordIdOrderBySortOrder` → 使用 `LambdaQueryWrapper.orderByAsc(MedicalRecordImage::getSortOrder)`

### 3. LifeRecordService.java ⚠️
需要替换的Repository:
- `LifeRecordRepository` → `LifeRecordMapper`
- `UserRepository` → `UserMapper`

关键方法迁移：
- `findByUserIdOrderByRecordDateDesc` → 使用 `LambdaQueryWrapper.orderByDesc(LifeRecord::getRecordDate)`
- `findByUserIdAndCategoryOrderByRecordDateDesc` → 使用 `LambdaQueryWrapper.eq().orderByDesc()`

### 4. ReminderService.java ⚠️
需要替换的Repository:
- `HealthReminderRepository` → `HealthReminderMapper`
- `UserRepository` → `UserMapper`

关键方法迁移：
- `findByUserIdOrderByCreatedAtDesc` → 使用 `LambdaQueryWrapper.orderByDesc(HealthReminder::getCreatedAt)`
- `findByUserIdAndEnabledOrderByReminderTimeAsc` → 使用 `LambdaQueryWrapper.eq().orderByAsc()`

## 迁移步骤

### 步骤1：更新导入语句

```java
// 旧导入
import com.health.repository.XxxRepository;

// 新导入
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.health.mapper.XxxMapper;
```

### 步骤2：替换字段定义

```java
// 旧
private final XxxRepository xxxRepository;

// 新
private final XxxMapper xxxMapper;
```

### 步骤3：替换方法调用

#### 查询单个对象
```java
// 旧
User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("不存在"));

// 新
User user = userMapper.selectById(id);
if (user == null) {
    throw new RuntimeException("不存在");
}
```

#### 保存/更新
```java
// 旧
record = repository.save(record);

// 新 - 插入
mapper.insert(record);  // record.getId() 会自动回填

// 新 - 更新
mapper.updateById(record);
```

#### 删除
```java
// 旧
repository.delete(record);
repository.deleteById(id);

// 新
mapper.deleteById(id);
```

#### 条件查询
```java
// 旧
repository.findByUserIdOrderByCreatedAtDesc(userId);

// 新
LambdaQueryWrapper<Entity> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(Entity::getUserId, userId)
       .orderByDesc(Entity::getCreatedAt);
List<Entity> list = mapper.selectList(wrapper);
```

#### 实体关联字段
```java
// 旧 - 使用关联对象
record.setUser(user);
Long userId = record.getUser().getId();

// 新 - 直接使用ID
record.setUserId(user.getId());
Long userId = record.getUserId();
```

## 已完成的Service（示例参考）

✅ `AuthService.java` - 完整示例  
✅ `HealthDataService.java` - 完整示例  
✅ `ProfileService.java` - 完整示例  
✅ `MedicationService.java` - 完整示例  
✅ `CustomUserDetailsService.java` - Security层示例

## 参考文档

- `LAMBDA_QUERY_WRAPPER_GUIDE.md` - 详细的查询方法指南
- `MYBATIS_PLUS_MIGRATION.md` - 迁移总体说明

## 注意事项

1. **实体类已更新**：所有实体类已使用 `userId` 等ID字段替代关联对象
2. **自动填充**：`createdAt` 和 `updatedAt` 字段会自动填充，无需手动设置
3. **事务管理**：`@Transactional` 注解继续使用，MyBatis Plus完全支持Spring事务
4. **分页查询**：需要时使用 MyBatis Plus 的 `Page<T>` 对象
5. **批量操作**：使用 `mapper.deleteBatchIds(ids)` 等批量方法

## 编译验证

完成迁移后，运行以下命令检查：

```bash
cd backend
./mvnw clean compile
```

如有编译错误，根据错误提示继续修改。

