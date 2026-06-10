buildscript {
    repositories {
        maven { url = uri("https://maven.aliyun.com/repository/public") }
        mavenCentral()
    }
    dependencies {
        classpath("org.flywaydb:flyway-core:11.5.0")
        classpath("org.flywaydb:flyway-database-postgresql:11.5.0")
        classpath("org.postgresql:postgresql:42.7.4")
    }
}

plugins {
    java
    id("org.springframework.boot") version "3.4.0"
    id("io.spring.dependency-management") version "1.1.6"
}

group = "com.family"
version = "0.1.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    maven { url = uri("https://maven.aliyun.com/repository/public") }
    maven { url = uri("https://maven.aliyun.com/repository/spring") }
    mavenCentral()
}

val springdocVersion = "2.7.0"

dependencies {
    // Web
    implementation("org.springframework.boot:spring-boot-starter-web")

    // MyBatis-Plus
    implementation("com.baomidou:mybatis-plus-spring-boot3-starter:3.5.10")

    // Validation
    implementation("org.springframework.boot:spring-boot-starter-validation")

    // Security
    implementation("org.springframework.boot:spring-boot-starter-security")

    // JWT
    implementation("io.jsonwebtoken:jjwt-api:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.6")

    // PostgreSQL
    runtimeOnly("org.postgresql:postgresql")

    // Flyway
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-database-postgresql")

    // SpringDoc OpenAPI
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:$springdocVersion")

    // Mail (SMTP)
    implementation("org.springframework.boot:spring-boot-starter-mail")

    // Lombok
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")

    // Test
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
}

// ---------------------------------------------------------------------------
// Load .env file (local development only — never committed)
// ---------------------------------------------------------------------------
fun loadDotEnv(): Map<String, String> {
    val envFile = file(".env")
    if (!envFile.exists()) return emptyMap()
    return envFile.readLines()
        .map { it.trim() }
        .filter { it.isNotEmpty() && !it.startsWith("#") }
        .map { line ->
            val eq = line.indexOf('=')
            if (eq == -1) null
            else line.substring(0, eq).trim() to line.substring(eq + 1).trim()
        }
        .filterNotNull()
        .toMap()
}

val dotEnv = loadDotEnv()

tasks.withType<Test> {
    useJUnitPlatform()
}

// Flyway migration task — uses Flyway API directly (compatible with Gradle 9)
tasks.register("flywayMigrate") {
    group = "flyway"
    description = "Run Flyway database migrations"

    doLast {
        fun env(key: String): String? = System.getenv(key)?.takeIf { it.isNotBlank() }
        val dbHost = env("DB_HOST") ?: dotEnv["DB_HOST"] ?: "localhost"
        val dbPort = env("DB_PORT") ?: dotEnv["DB_PORT"] ?: "5432"
        val dbName = env("DB_NAME") ?: dotEnv["DB_NAME"] ?: "family_os"
        val dbUser = env("DB_USER") ?: dotEnv["DB_USER"] ?: "family_user"
        val dbPassword = env("DB_PASSWORD") ?: dotEnv["DB_PASSWORD"] ?: ""

        val url = "jdbc:postgresql://${dbHost}:${dbPort}/${dbName}"
        logger.lifecycle("Flyway: migrating $url ...")

        val ds = org.postgresql.ds.PGSimpleDataSource()
        ds.serverNames = arrayOf(dbHost)
        ds.portNumbers = intArrayOf(dbPort.toInt())
        ds.databaseName = dbName
        ds.user = dbUser
        ds.password = dbPassword

        val flyway = org.flywaydb.core.Flyway.configure()
            .dataSource(ds)
            .locations("filesystem:${projectDir}/src/main/resources/db/migration")
            .load()

        val result = flyway.migrate()
        logger.lifecycle("Flyway: ${result.migrationsExecuted} migration(s) executed")
    }
}

// Inject .env into bootRun
tasks.named<org.springframework.boot.gradle.tasks.run.BootRun>("bootRun") {
    environment(dotEnv)
}
