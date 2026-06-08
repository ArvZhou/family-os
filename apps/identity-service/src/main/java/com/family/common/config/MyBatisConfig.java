package com.family.common.config;

import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@MapperScan("com.family.*.mapper")
public class MyBatisConfig {

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        return new MybatisPlusInterceptor();
    }
}
