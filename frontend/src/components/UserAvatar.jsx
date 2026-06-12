export default function UserAvatar({ user, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-16 h-16 text-xl',
  }

  const base = `${sizes[size] || sizes.md} rounded-full flex items-center justify-center overflow-hidden bg-brand-600/30 ${className}`

  const avatarSrc = user?.avatar
    ? (user.avatar.startsWith('http')
        ? user.avatar
        : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${user.avatar}`)
    : null

  if (avatarSrc) {
    return <img src={avatarSrc} alt={`${user.firstName} ${user.lastName}`} className={`${base} object-cover`} />
  }

  return (
    <div className={base}>
      <span className="font-semibold text-brand-400">
        {user?.firstName?.[0]}{user?.lastName?.[0]}
      </span>
    </div>
  )
}
