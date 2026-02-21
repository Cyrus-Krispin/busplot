package com.busplot.busplot.config;

import io.github.cdimascio.dotenv.Dotenv;

import java.nio.file.Path;
import java.nio.file.Paths;

public final class DotenvLoader {

    private DotenvLoader() {}

    public static Dotenv load() {
        String userDir = System.getProperty("user.dir");
        Path backendEnv = Paths.get(userDir, ".env");
        if (backendEnv.toFile().exists()) {
            return Dotenv.configure().directory(userDir).ignoreIfMissing().load();
        }
        Path parentEnv = Paths.get(userDir, "backend", ".env");
        if (parentEnv.toFile().exists()) {
            return Dotenv.configure().directory(Paths.get(userDir, "backend").toString()).ignoreIfMissing().load();
        }
        return Dotenv.configure().ignoreIfMissing().load();
    }
}
