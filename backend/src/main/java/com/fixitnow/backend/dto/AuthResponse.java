package com.fixitnow.backend.dto;

public class AuthResponse {

    private String token;
    private UserInfo user;

    public AuthResponse(String token, Long id, String name, String email, String role) {
        this(token, id, name, email, role, true, null, false, null);
    }

    public AuthResponse(String token,
                        Long id,
                        String name,
                        String email,
                        String role,
                        boolean active,
                        String providerApprovalStatus,
                        boolean accessLimited,
                        String accessMessage) {
        this.token = token;
        this.user = new UserInfo(id, name, email, role, active, providerApprovalStatus, accessLimited, accessMessage);
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
        private boolean active;
        private String providerApprovalStatus;
        private boolean accessLimited;
        private String accessMessage;

        public UserInfo(Long id, String name, String email, String role) {
            this(id, name, email, role, true, null, false, null);
        }

        public UserInfo(Long id,
                        String name,
                        String email,
                        String role,
                        boolean active,
                        String providerApprovalStatus,
                        boolean accessLimited,
                        String accessMessage) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.role = role;
            this.active = active;
            this.providerApprovalStatus = providerApprovalStatus;
            this.accessLimited = accessLimited;
            this.accessMessage = accessMessage;
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

        public boolean isActive() {
            return active;
        }

        public String getProviderApprovalStatus() {
            return providerApprovalStatus;
        }

        public boolean isAccessLimited() {
            return accessLimited;
        }

        public String getAccessMessage() {
            return accessMessage;
        }
    }
}
