import { useCallback, useEffect, useState } from 'react'

import api from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

import { Button } from './ui/button'

export function ProfileComponent() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    const response = await api.get(`/profiles/${user!.id}`)

    if (response.data.data) {
      const profileData = response.data.data
      setProfile(profileData)
      setUsername(profileData.username || '')
      setFullName(profileData.full_name || '')
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user, fetchProfile])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)

    await api.put(`/profiles/${user!.id}`, {
      username,
      full_name: fullName,
    })

    alert('Profile updated!')
    fetchProfile()
    setLoading(false)
  }

  if (!user) return null

  return (
    <div className="rounded-md border p-4">
      <h3 className="mb-4 text-lg font-semibold">Profile</h3>

      {loading ? (
        <p>Loading profile...</p>
      ) : (
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded border p-2"
              minLength={3}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded border p-2"
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      )}

      {profile && (
        <div className="mt-4 text-sm text-gray-600">
          <p>Profile ID: {profile.id}</p>
          <p>Last updated: {profile.updated_at || 'Never'}</p>
        </div>
      )}
    </div>
  )
}
