export const getAvatarUrl = (profileImage, name = 'User') => {
  if (!profileImage) {
    return `https://ui-avatars.com/api/?background=6366f1&color=fff&size=128&name=${encodeURIComponent(name)}`;
  }
  if (profileImage.startsWith('http://') || profileImage.startsWith('https://')) {
    return profileImage;
  }
  const cleanPath = profileImage.startsWith('/') ? profileImage : `/${profileImage}`;
  return `http://localhost:5000${cleanPath}`;
};
