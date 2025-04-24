import { useState, useEffect, useCallback } from 'react';
import { FiEdit2, FiUpload } from 'react-icons/fi';
import { authService } from '../services/api';

const Profile = ({ userData, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    address: userData?.address || '',
    position: userData?.position || '',
    department: userData?.department || '',
    joiningDate: userData?.joiningDate || '',
    profilePic: userData?.profilePic || ''
  });

  // Update form data when userData changes
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        position: userData.position || '',
        department: userData.department || '',
        joiningDate: userData.joiningDate || '',
        profilePic: userData.profilePic || ''
      });
    }
  }, [userData]);

  // Function to handle file input change for photo upload
  const handlePhotoUpload = useCallback(() => {
    // Reset any previous errors
    setUploadError('');
    
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/jpeg,image/png,image/jpg';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    // Handle file selection
    fileInput.onchange = async (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
          setUploadError('Please select a valid image file (JPEG or PNG)');
          document.body.removeChild(fileInput);
          return;
        }
        
        // Validate file size (max 2MB)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
          setUploadError('Image size should be less than 2MB');
          document.body.removeChild(fileInput);
          return;
        }
        
        setIsUploading(true);
        
        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'imageEMS'); // Using your custom preset
        formData.append('cloud_name', 'dik64jv3h');
        
        try {
          // Upload directly to Cloudinary
          const response = await fetch(
            `https://api.cloudinary.com/v1_1/dik64jv3h/image/upload`,
            {
              method: 'POST',
              body: formData,
            }
          );
          
          const data = await response.json();
          
          if (data.secure_url) {
            // Get the public_id from Cloudinary response
            const publicId = data.public_id;
            
            // Update the profile picture in the database
            authService.uploadProfilePhoto(data.secure_url, publicId)
              .then(response => {
                // Update local state with the new profile picture
                setFormData(prev => ({
                  ...prev,
                  profilePic: data.secure_url
                }));
                // Call the onUpdate prop to update parent component state
                onUpdate({ ...userData, profilePic: data.secure_url });
                setIsUploading(false);
                setUploadError('');
              })
              .catch(err => {
                console.error('Error updating profile photo in database:', err);
                setIsUploading(false);
                setUploadError('Failed to update profile. Please try again.');
              });
          } else {
            console.error('Error uploading to Cloudinary:', data);
            setIsUploading(false);
            setUploadError(data.error?.message || 'Failed to upload image. Please try again.');
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          setIsUploading(false);
          setUploadError('Network error. Please check your connection and try again.');
        }
      }
      
      // Remove the file input from the DOM
      document.body.removeChild(fileInput);
    };
    
    // Trigger the file input click
    fileInput.click();
  }, [userData, onUpdate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <FiEdit2 />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  {isUploading ? (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : formData.profilePic ? (
                    <img 
                      src={formData.profilePic} 
                      alt={userData.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-600">
                        {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handlePhotoUpload}
                  disabled={isUploading}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <FiUpload size={16} />
                </button>
              </div>
              {uploadError && (
                <div className="mt-2 text-red-500 text-sm">
                  {uploadError}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-800 text-xl">{userData.name}</h3>
                <p className="text-blue-600 font-medium">{userData.position}</p>
                {userData.employeeId && (
                  <p className="text-gray-500 text-sm mt-1">
                    <span className="font-medium">ID:</span> {userData.employeeId}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 outline-none transition-all ${
                isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled={true}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 outline-none transition-all bg-gray-50 border-gray-200 text-gray-700`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 outline-none transition-all ${
                isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Position</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 outline-none transition-all ${
                isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 outline-none transition-all ${
                isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Joining Date</label>
            <input
              type="date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 outline-none transition-all ${
                isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={!isEditing}
              rows={3}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 outline-none transition-all ${
                isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            />
          </div>

          {isEditing && (
            <div className="md:col-span-2 flex justify-end mt-4">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all font-medium"
              >
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;