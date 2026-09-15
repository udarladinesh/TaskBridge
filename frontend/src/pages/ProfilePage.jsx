import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import RatingStars from '../components/RatingStars';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAvatarUrl } from '../utils/avatar';
import { User, Mail, Calendar, Edit3, Star, AlertCircle, Upload, Check } from 'lucide-react';

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
        if (res.data.success) setRatingsData(res.data);
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
      if (profileImageFile) formData.append('profileImage', profileImageFile);

      const res = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString([], { month: 'long', year: 'numeric' })
    : 'Recently joined';

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '860px' }}>

        {/* ── Profile Card ─────────────────────────── */}
        <div
          className="glass-card"
          style={{
            marginBottom: '1.75rem',
            padding: '0',
            overflow: 'hidden',
            borderTop: '2px solid rgba(99,102,241,0.4)',
          }}
        >
          {/* Header gradient band */}
          <div
            style={{
              height: '90px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(34,211,238,0.1) 50%, rgba(168,85,247,0.08) 100%)',
              position: 'relative',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          />

          <div style={{ padding: '0 2rem 2rem' }}>
            {/* Avatar row (overlapping header) */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: '1.25rem',
                marginTop: '-40px',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img
                  src={imagePreview || getAvatarUrl(user.profileImage, user.name)}
                  alt={user.name}
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid rgba(99,102,241,0.6)',
                    boxShadow: '0 0 24px rgba(99,102,241,0.35)',
                    display: 'block',
                    background: 'var(--bg-surface)',
                  }}
                />
                {isEditing && (
                  <label
                    htmlFor="avatar-upload"
                    style={{
                      position: 'absolute',
                      bottom: 2, right: 2,
                      width: '26px', height: '26px',
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    }}
                  >
                    <Upload size={12} color="#fff" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>

              <button
                onClick={() => { setIsEditing(!isEditing); setImagePreview(null); setProfileImageFile(null); }}
                className={isEditing ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
                style={{ alignSelf: 'flex-start', marginTop: '40px' }}
              >
                {isEditing ? (
                  <>✕ Cancel</>
                ) : (
                  <><Edit3 size={14} /> Edit Profile</>
                )}
              </button>
            </div>

            {/* Name, email, rating */}
            <h1
              style={{
                fontSize: '1.55rem',
                fontWeight: 800,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: '-0.02em',
                marginBottom: '0.25rem',
              }}
            >
              {user.name}
            </h1>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
              {user.email}
            </p>

            {/* Stats row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RatingStars value={ratingsData.avgRating} readOnly size={16} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {ratingsData.avgRating > 0 ? ratingsData.avgRating.toFixed(1) : '—'}
                  {' '}({ratingsData.totalRatings} {ratingsData.totalRatings === 1 ? 'review' : 'reviews'})
                </span>
              </div>
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  fontSize: '0.83rem', color: 'var(--text-muted)',
                }}
              >
                <Calendar size={13} />
                Member since {joinDate}
              </div>
            </div>

            {!isEditing && user.bio && (
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-sub)',
                  lineHeight: '1.6',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem 1rem',
                  maxWidth: '560px',
                }}
              >
                {user.bio}
              </p>
            )}

            {/* Edit Form */}
            {isEditing && (
              <form
                onSubmit={handleProfileSave}
                style={{
                  marginTop: '1.25rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                {error && (
                  <div className="alert-error" style={{ marginBottom: '1rem' }}>
                    <AlertCircle size={15} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid-2" style={{ marginBottom: '0' }}>
                  <div className="form-group">
                    <label className="form-label">Display Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Bio / About Me</label>
                  <textarea
                    className="form-textarea"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe yourself, your skills, and your availability..."
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={saving}
                >
                  {saving ? (
                    'Saving...'
                  ) : (
                    <><Check size={14} /> Save Changes</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Ratings & Reviews ────────────────────── */}
        <div className="glass-card" style={{ borderTop: '2px solid rgba(245,158,11,0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '36px', height: '36px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(245,158,11,0.12)',
                border: '1px solid rgba(245,158,11,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--amber-light)',
                flexShrink: 0,
              }}
            >
              <Star size={18} />
            </div>
            <div>
              <h3
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  margin: 0,
                }}
              >
                Ratings & Reviews
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Feedback received from task collaborations
              </p>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading ratings..." />
          ) : ratingsData.ratings.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
              }}
            >
              No reviews received yet. Complete or post tasks to receive ratings.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {ratingsData.ratings.map((r) => (
                <div
                  key={r._id}
                  style={{
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem 1.1rem',
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.4rem',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                        {r.fromUser?.name || 'Anonymous User'}
                      </span>
                      <RatingStars value={r.rating} readOnly size={14} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(r.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  {r.comment && (
                    <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem', margin: '0.2rem 0', fontStyle: 'italic' }}>
                      "{r.comment}"
                    </p>
                  )}
                  {r.task && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--cyan)', display: 'block', marginTop: '0.45rem' }}>
                      Task: {r.task.title}
                    </span>
                  )}
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
