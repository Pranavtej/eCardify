function getSocialMediaIcon(fieldName) {
        switch (fieldName.toLowerCase()) {
            case 'linkedin':
                return 'linkedin-square';
            case 'instagram':
                return 'instagram';
            default:
                return 'default-icon'; // Replace with a default icon class or URL
        }
    }
