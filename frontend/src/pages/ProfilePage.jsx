import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import RatingStars from '../components/RatingStars';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAvatarUrl } from '../utils/avatar';
import { User, Mail, Calendar, Edit3, Star, CheckCircle2, FileText, AlertCircle, Upload } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [ratingsData, setRatingsData] = useState({ avgRating: 0, totalRatings: 0, ratings: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUserRatings = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await api.get(`/ratings/user/${user._id}`);
        if (res.data.success) {
          setRatingsData(res.data);
        }
      } catch (err) {
        console.error('Fetch Ratings Error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRatings();
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('bio', bio);
      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }

      const res = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        updateUser(res.data.user);
        setIsEditing(false);
        setProfileImageFile(null);
        setImagePreview(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '850px' }}>
        {/* Profile Card Header */}
        <div className="glass-card" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <img
                src={imagePreview || getAvatarUrl(user.profileImage, user.name)}
                alt={user.name}
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
              />
              <div>
                <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem' }}>{user.name}</h1>
                <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '0.4rem' }}>{user.email}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <RatingStars value={ratingsData.avgRating} readOnly size={18} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>({ratingsData.totalRatings} ratings)</span>
                </div>
              </div>
            </div>

            <button onClick={() => { setIsEditing(!isEditing); setImagePreview(null); setProfileImageFile(null); }} className="btn btn-secondary btn-sm">
              <Edit3 size={16} /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>

          {/* Edit Profile Form */}
          {isEditing && (
            <form onSubmit={handleProfileSave} style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
              {error && <div style={{ color: 'var(--rose)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}

              <div className="form-group">
                <label className="form-label">Profile Picture</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="form-control"
                    style={{ padding: '0.4rem 0.75rem' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Bio / About Me</label>
                <textarea className="form-textarea" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Describe yourself..." />
              </div>

              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          )}

          {!isEditing && user.bio && (
            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', color: 'var(--text-sub)', fontSize: '0.925rem' }}>
              <strong>Bio:</strong> {user.bio}
            </div>
          )}
        </div>

        {/* Ratings & Feedback List */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star size={20} /> Ratings & Reviews Received
          </h3>

          {loading ? (
            <LoadingSpinner text="Loading ratings..." />
          ) : ratingsData.ratings.length === 0 ? (
            <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>No reviews received yet. Complete or post tasks to receive ratings.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {ratingsData.ratings.map((r) => (
                <div
                  key={r._id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.925rem' }}>
                        {r.fromUser?.name || 'Anonymous User'}
                      </span>
                      <RatingStars value={r.rating} readOnly size={16} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {r.comment && <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>"{r.comment}"</p>}
                  {r.task && <span style={{ fontSize: '0.75rem', color: 'var(--cyan)', display: 'block', marginTop: '0.35rem' }}>Task: {r.task.title}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
