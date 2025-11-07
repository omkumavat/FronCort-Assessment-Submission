// utils/auth.js
export const initUser = () => {
  let user = JSON.parse(localStorage.getItem('user'))
  if (!user) {
    user = {
      id: crypto.randomUUID(),
      name: `User-${Math.floor(Math.random() * 1000)}`,
      avatar: `https://api.dicebear.com/9.x/identicon/svg?seed=${Math.random()}`,
      role: 'editor',
    }
    localStorage.setItem('user', JSON.stringify(user))
  }
  return user
}
