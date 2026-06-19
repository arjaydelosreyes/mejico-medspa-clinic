import { auth, database } from '../firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  applyActionCode
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

// Export all necessary functions
export const register = async (email, password, firstName, lastName, username) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    await sendEmailVerification(user)
    await createUserDocument(user, { firstName, lastName, username })
    return user
  } catch (error) {
    console.error('Registration error:', error)
    throw error
  }
}

export const resendEmailVerification = async () => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('No user is currently signed in')
    }
    await sendEmailVerification(user)
    return true
  } catch (error) {
    console.error('Error resending verification:', error)
    throw error
  }
}

// Rest of your existing authService code...
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    const userDoc = await getDoc(doc(database, 'users', user.uid))
    if (!userDoc.exists()) {
      await setDoc(doc(database, 'users', user.uid), {
        email: user.email,
        role: 'client',
        createdAt: new Date().toISOString()
      })
    }

    const userRole = userDoc.exists() ? userDoc.data().role : 'client'
    localStorage.setItem('userRole', userRole)

    await user.getIdToken(true)
    return { user, role: userRole }
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    console.error('Password reset error:', error)
    throw error
  }
}

export const logout = async () => {
  try {
    await signOut(auth)
    localStorage.removeItem('userRole')
  } catch (error) {
    console.error('Logout error:', error)
    throw error
  }
}

export const isAdmin = async () => {
  try {
    const user = auth.currentUser
    if (!user) return false

    const userDoc = await getDoc(doc(database, 'users', user.uid))
    if (!userDoc.exists()) return false

    const userData = userDoc.data()
    return userData.role === 'admin'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    }, reject)
  })
}

const createUserDocument = async (user, additionalData = {}) => {
  const userRef = doc(database, 'users', user.uid)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    const userData = {
      email: user.email,
      uid: user.uid,
      firstName: additionalData.firstName,
      lastName: additionalData.lastName,
      username: additionalData.username,
      role: 'client',
      registrationDate: new Date().toISOString(),
    }
    await setDoc(userRef, userData)
  }
}

// Export all necessary functions
export {
  createUserDocument,
  sendEmailVerification,
  applyActionCode
}