import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, ShieldCheck, Mail, Lock, Settings, KeyRound, CheckCircle } from 'lucide-react';

export const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!profileForm.name || !profileForm.email) {
      setProfileError('Name and Email fields are required.');
      return;
    }

    setProfileLoading(true);
    try {
      await updateProfile({
        name: profileForm.name,
        email: profileForm.email,
      });
      setProfileSuccess('Profile details updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile details.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const { currentPassword, newPassword, confirmNewPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    setPasswordLoading(true);
    try {
      // In userController backend, sending password in profile update triggers Pre-Save Schema encryption
      await updateProfile({
        password: newPassword,
      });

      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change account password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
      <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
        <Settings className="w-5 h-5 text-sky-500" />
        Account Profile
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Profile Card */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4 text-center">
          <div className="relative inline-block">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-sky-100 shadow-inner"
              />
            ) : (
              <div className="w-24 h-24 bg-sky-500 text-white rounded-full mx-auto flex items-center justify-center text-3xl font-bold shadow-md">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Active Account">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-800">{user?.name}</h2>
            <p className="text-xs text-slate-400 font-semibold">{user?.email}</p>
            <div className="pt-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-sky-50 text-sky-600 border border-sky-100 px-2.5 py-1 rounded-full">
                {user?.role === 'admin' ? 'Administrator' : 'Customer Account'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Columns: Forms (Edit Profile and Password change) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Edit Profile Form */}
          <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <User className="w-4.5 h-4.5 text-sky-500" />
              Personal Profile Details
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="input-field"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Email Address</label>
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      name="email"
                      className="input-field pl-10"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                  </div>
                </div>
              </div>

              {profileError && <p className="text-xs font-semibold text-red-500">{profileError}</p>}
              {profileSuccess && (
                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  {profileSuccess}
                </p>
              )}

              <button
                type="submit"
                disabled={profileLoading}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {profileLoading ? 'Saving changes...' : 'Save Profile Details'}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <KeyRound className="w-4.5 h-4.5 text-sky-500" />
              Change Account Password
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Current Password</label>
                  <div className="relative flex items-center">
                    <input
                      type="password"
                      name="currentPassword"
                      placeholder="••••••••"
                      className="input-field pl-10"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">New Password</label>
                  <div className="relative flex items-center">
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="At least 6 characters"
                      className="input-field pl-10"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Confirm New Password</label>
                  <div className="relative flex items-center">
                    <input
                      type="password"
                      name="confirmNewPassword"
                      placeholder="Confirm password"
                      className="input-field pl-10"
                      value={passwordForm.confirmNewPassword}
                      onChange={handlePasswordChange}
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                  </div>
                </div>
              </div>

              {passwordError && <p className="text-xs font-semibold text-red-500">{passwordError}</p>}
              {passwordSuccess && (
                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  {passwordSuccess}
                </p>
              )}

              <button
                type="submit"
                disabled={passwordLoading}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {passwordLoading ? 'Updating password...' : 'Update Password'}
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Profile;
