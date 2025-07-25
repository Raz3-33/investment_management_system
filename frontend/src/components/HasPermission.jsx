import React from 'react';

// Custom HasPermission Component
const HasPermission = ({ permission, children, fallback = null }) => {
  const [userPermissions, setUserPermissions] = React.useState([]);

  // Simulate fetching permissions from the backend or context
  useEffect(() => {
    // This would ideally be fetched from your user context or API
    const fetchPermissions = async () => {
      try {
        // Assuming this API returns the user's permissions
        const response = await axios.get('/api/user/permissions');
        setUserPermissions(response.data.permissions || []);
      } catch (error) {
        console.error('Error fetching permissions:', error);
      }
    };

    fetchPermissions();
  }, []);

  // Check if user has the permission
  if (userPermissions.includes(permission)) {
    return <>{children}</>;
  } else {
    return <>{fallback || <span>You don't have permission to view this.</span>}</>;
  }
};

export default HasPermission;
