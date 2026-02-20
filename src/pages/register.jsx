import React, { useEffect } from 'react'
import RegisterUser from '../components/forms/registerForm'
import Layout from '../components/Layout'
import { useSeoContext } from '../context/SeoProvider'
function register() {
  const { updateSeo } = useSeoContext();

  useEffect(() => {
    const canonicalUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/register`
      : '/register';

    updateSeo({
      title: 'Create your Diksx Cars account',
      description: 'Create your Diksx Cars account to start buying or selling vehicles, spares and accessories in Kenya.',
      canonical: canonicalUrl,
      type: 'website',
    });
  }, [updateSeo]);

  return (
    <Layout>
      <RegisterUser />
    </Layout>
  )
}

export default register