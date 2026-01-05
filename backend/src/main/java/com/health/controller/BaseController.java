package com.health.controller;

import com.health.security.UserPrincipal;

/**
 * 基础控制器 - 提供公共方法
 */
public abstract class BaseController {
    
    /**
     * 获取当前用户ID
     * 如果用户未登录（UserPrincipal为null），返回默认测试用户ID
     * 
     * @param user 当前认证用户
     * @return 用户ID，如果未认证则返回 1L（测试用）
     */
    protected Long getCurrentUserId(UserPrincipal user) {
        if (user == null) {
            // 开发/测试环境：返回默认用户 ID
            // 生产环境：应该抛出异常或返回 null
            return 1L;
        }
        return user.getId();
    }
    
    /**
     * 检查用户是否已认证
     * 
     * @param user 当前认证用户
     * @return true 如果已认证，false 否则
     */
    protected boolean isAuthenticated(UserPrincipal user) {
        return user != null && user.getId() != null;
    }
}

