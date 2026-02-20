import { useEffect } from 'react';
import Layout from '../components/Layout';
import LoginForm from '../components/forms/loginForm';
import { useSeoContext } from '../context/SeoProvider';


export default function Login() {
  const { updateSeo } = useSeoContext();

  useEffect(() => {
    const canonicalUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/login`
      : '/login';

    updateSeo({
      title: 'Sign in to Diksx Cars | Vehicle marketplace',
      description: 'Sign in to your Diksx Cars account to manage your vehicle listings, accessories, and purchases.',
      canonical: canonicalUrl,
      type: 'website',
    });
  }, [updateSeo]);

  return (
  <Layout>
      <LoginForm /> 
  </Layout>
  );
}


