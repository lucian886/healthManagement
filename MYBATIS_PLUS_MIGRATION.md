# MyBatis Plus 迁移说明

本项目已从 JPA 迁移到 MyBatis Plus。

## 已完成的工作

### 1. 依赖更新
- ✅ 移除 `spring-boot-starter-data-jpa` 依赖
- ✅ 添加 `mybatis-plus-boot-starter` 依赖

### 2. 实体类更新
所有实体类已从 JPA 注解迁移到 MyBatis Plus 注解：
- `@Entity` → `@TableName`
- `@Id` + `@GeneratedValue` → `@TableId(type = IdType.AUTO)`
- `@Column` → `@TableField`
- 移除了 `@ManyToOne`、`@OneToOne`、`@OneToMany` 等关系注解
- 实体类中的关联对象改为直接使用ID（如 `User user` → `Long userId`）

### 3. Mapper 接口创建
已在 `com.health.mapper` 包下创建所有 Mapper 接口：
- UserMapper
- HealthDataMapper
- MedicalRecordMapper
- MedicalRecordImageMapper
- UserProfileMapper
- ChatHistoryMapper
- HealthReminderMapper
- MedicationRecordMapper
- LifeRecordMapper

### 4. 配置文件更新
- ✅ 创建 `MybatisPlusConfig` 配置类（分页插件、自动填充处理器）
- ✅ 更新 `application.yml` 和 `application-prod.yml`，添加 MyBatis Plus 配置

## 需要手动完成的工作

### Service 层更新

由于 MyBatis Plus 与 JPA 的API差异，需要手动更新 Service 层代码：

#### 1. 导入包替换
```java
// 旧的 JPA Repository 导入
import com.health.repository.UserRepository;

// 新的 MyBatis Plus Mapper 导入
import com.health.mapper.UserMapper;
```

#### 2. 字段名替换
```java
// 旧
private final UserRepository userRepository;

// 新
private final UserMapper userMapper;
```

#### 3. 方法调用替换

| JPA Repository 方法 | MyBatis Plus Mapper 方法 |
|---------------------|-------------------------|
| `repository.save(entity)` | `mapper.insert(entity)` 或 `mapper.updateById(entity)` |
| `repository.findById(id)` | `mapper.selectById(id)` |
| `repository.findAll()` | `mapper.selectList(null)` |
| `repository.delete(entity)` | `mapper.deleteById(entity.getId())` |
| `repository.deleteById(id)` | `mapper.deleteById(id)` |
| `repository.existsById(id)` | `mapper.selectById(id) != null` |

#### 4. 自定义查询方法

JPA 的方法名查询需要改为：
- 在 Mapper 接口中使用 `@Select` 注解
- 或使用 MyBatis Plus 的 QueryWrapper

示例：
```java
// 方式1：使用 Mapper 接口中的自定义方法
User user = userMapper.findByUsername(username);

// 方式2：使用 QueryWrapper
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.eq("username", username);
User user = userMapper.selectOne(wrapper);
```

#### 5. 关联查询处理

由于实体类不再使用关联注解，需要手动处理关联：

```java
// 旧的 JPA 方式（自动加载关联对象）
User user = userRepository.findById(id).orElseThrow();
UserProfile profile = user.getProfile(); // 自动加载

// 新的 MyBatis Plus 方式（手动查询关联对象）
User user = userMapper.selectById(id);
UserProfile profile = userProfileMapper.findByUserId(user.getId());
```

### Security 层更新

由于 `User` 实体不再有关联对象，需要更新 `CustomUserDetailsService`：

```java
// 旧
@Override
public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("用户不存在"));
    
    return UserPrincipal.create(user);
}

// 新
@Override
public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    User user = userMapper.findByUsername(username);
    if (user == null) {
        throw new UsernameNotFoundException("用户不存在");
    }
    
    return UserPrincipal.create(user);
}
```

## 需要更新的 Service 文件列表

1. ✅ `AuthService.java` - **需要更新**
2. ✅ `ChatService.java` - **需要更新**
3. ✅ `HealthDataService.java` - **需要更新**
4. ✅ `MedicationService.java` - **需要更新**
5. ✅ `LifeRecordService.java` - **需要更新**
6. ✅ `ReminderService.java` - **需要更新**
7. ✅ `MedicalRecordService.java` - **需要更新**
8. ✅ `ProfileService.java` - **需要更新**
9. ⚠️ `OssService.java` - 无需更新（不涉及数据库操作）

## 数据库迁移

**注意**：MyBatis Plus 不会自动创建或更新数据库表结构。

确保数据库中已经存在所有必需的表。如果需要，可以：
1. 使用之前 JPA 生成的表结构
2. 手动编写 SQL 创建脚本
3. 使用 Flyway 或 Liquibase 进行数据库版本管理

## 测试建议

1. 逐个 Service 进行更新和测试
2. 重点测试关联查询的业务逻辑
3. 确保事务管理正常工作
4. 测试分页功能

## 参考资料

- [MyBatis Plus 官方文档](https://baomidou.com/)
- [MyBatis Plus CRUD 接口](https://baomidou.com/pages/49cc81/)
- [条件构造器](https://baomidou.com/pages/10c804/)

