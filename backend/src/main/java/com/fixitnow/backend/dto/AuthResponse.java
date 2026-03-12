package com.fixitnow.backend.dto;

public class AuthResponse {

    private String token;
    private UserInfo user;

    public AuthResponse(String token, Long id, String name, String email, String role) {
        this.token = token;
        this.user = new UserInfo(id, name, email, role);
    }

    public String getToken() {
        return token;
    }

    public UserInfo getUser() {
        return user;
    }

    // Inner static class for user object
    public static class UserInfo {
        private Long id;
        private String name;
        private String email;
        private String role;

        public UserInfo(Long id, String name, String email, String role) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.role = role;
        }

        public Long getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public String getEmail() {
            return email;
        }

        public String getRole() {
            return role;
        }
    }
}
