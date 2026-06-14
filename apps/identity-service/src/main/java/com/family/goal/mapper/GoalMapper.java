package com.family.goal.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.family.goal.entity.Goal;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface GoalMapper extends BaseMapper<Goal> {
}
