package com.health.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.health.entity.UserProfile;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户档案Mapper
 */
@Mapper
public interface UserProfileMapper extends BaseMapper<UserProfile> {
    // 使用 LambdaQueryWrapper 在 Service 层进行查询
}
