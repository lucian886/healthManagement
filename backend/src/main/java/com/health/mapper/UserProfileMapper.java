package com.health.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.health.entity.UserProfile;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * 用户档案Mapper
 */
@Mapper
public interface UserProfileMapper extends BaseMapper<UserProfile> {
    
    @Select("SELECT * FROM user_profiles WHERE user_id = #{userId} LIMIT 1")
    UserProfile findByUserId(@Param("userId") Long userId);
}

