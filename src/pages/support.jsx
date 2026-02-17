import React, { useEffect } from 'react'
import Layout from '../components/Layout'
import { useSeoContext } from '../context/SeoProvider'


function support() {
    const { updateSeo } = useSeoContext();

    // Update SEO metadata for support page
    useEffect(() => {
        const canonicalUrl = 'https://www.diksxcars.co.ke/support';
        window.scrollTo({ top: 0, behavior: 'instant' });
        updateSeo({
            title: 'Customer Support | Help Center | Diksx Cars & Spares',
            description: 'Get help with buying or selling vehicles on Diksx Cars & Spares. Browse FAQs, safety tips, and contact our support team for assistance.',
            canonical: canonicalUrl,
            type: 'website',
            additionalMetaTags: [
                { name: 'robots', content: 'index, follow' },
            ]
        });
    }, [updateSeo]);

    return (
        <Layout>
            <div className='mt-10 flex justify-center'>
                <div className='w-[1200px] bg-white shadow rounded-lg p-10 flex flex-col gap-6'>
                    <h3 className='flex justify-between items-center'>
                        <h1 className='text-2xl  text-neutral-950'>Welcome to Our Support Center</h1>
                    </h3>
                    <section className='flex flex-col gap-6'>
                        <p className='text-neutral-600 text-lg'>
                            We're here to help you navigate through our platform and ensure a smooth experience while
                            buying or selling second-hand cars. If you have any questions or need assistance, you're in
                            the right place!
                        </p>
                        <div className='flex flex-col gap-4'>
                            <h2 className='text-lg font-medium text-neutral-950'>How Can We Help You?</h2>
                            <ul className='flex flex-col gap-4'>
                                <li className='p-4 bg-neutral-50 rounded-md flex justify-between items-center'>
                                    <span className='text-sm text-neutral-950 font-medium'>Browse Our FAQs</span>
                                    <a
                                        href='#faq'
                                        className='text-primary-500 text-sm font-medium hover:underline'
                                    >
                                        Read FAQs →
                                    </a>
                                </li>
                                <li className='p-4 bg-neutral-50 rounded-md flex justify-between items-center'>
                                    <span className='text-sm text-neutral-950 font-medium'>Video Tutorials</span>
                                    <a
                                        href='#tutorials'
                                        className='text-primary-500 text-sm font-medium hover:underline'
                                    >
                                        Watch Tutorials →
                                    </a>
                                </li>
                                <li className='p-4 bg-neutral-50 rounded-md flex justify-between items-center'>
                                    <span className='text-sm text-neutral-950 font-medium'>Live Chat Support</span>
                                    <a
                                        href='#live-chat'
                                        className='text-primary-500 text-sm font-medium hover:underline'
                                    >
                                        Start Live Chat →
                                    </a>
                                </li>
                                <li className='p-4 bg-neutral-50 rounded-md flex justify-between items-center'>
                                    <span className='text-sm text-neutral-950 font-medium'>Submit a Ticket</span>
                                    <a
                                        href='#submit-ticket'
                                        className='text-primary-500 text-sm font-medium hover:underline'
                                    >
                                        Submit a Ticket →
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className='flex flex-col gap-4'>
                            <h2 className='text-lg font-medium text-neutral-950'>Safety Tips</h2>
                            <div className='p-4 bg-neutral-50 rounded-md flex flex-col gap-2'>
                                <ul className='list-disc list-inside text-lg text-neutral-600'>
                                    <li>Always meet in safe, public locations when viewing or selling cars.</li>
                                    <li>Verify vehicle details, including ownership and history.</li>
                                    <li>Avoid upfront payments unless verified through our platform.</li>
                                </ul>
                                <a
                                    href='#safety-guide'
                                    className='text-primary-500 text-sm font-medium hover:underline mt-2'
                                >
                                    Read Full Safety Guide →
                                </a>
                            </div>
                        </div>

                        <div className='flex flex-col gap-4'>
                            <h2 className='text-lg font-medium text-neutral-950'>Popular Resources</h2>
                            <div className='flex flex-col gap-4'>
                                <div className='p-4 bg-neutral-50 rounded-md'>
                                    <h3 className='text-sm font-medium text-neutral-950'>For Buyers:</h3>
                                    <ul className='list-disc list-inside text-lg text-neutral-600 mt-2'>
                                        <li>How to inspect a car before purchase.</li>
                                        <li>Tips for negotiating prices.</li>
                                    </ul>
                                </div>
                                <div className='p-4 bg-neutral-50 rounded-md'>
                                    <h3 className='text-sm font-medium text-neutral-950'>For Sellers:</h3>
                                    <ul className='list-disc list-inside text-lg text-neutral-600 mt-2'>
                                        <li>Best practices for pricing your car.</li>
                                        <li>Effective ways to write a compelling car description.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className='flex flex-col gap-4'>
                            <h2 className='text-lg font-medium text-neutral-950'>Contact Us</h2>
                            <div className='p-4 bg-neutral-50 rounded-md'>
                                <ul className='text-sm text-neutral-600'>
                                    <li>Email: support@diksxcars.co.ke</li>
                                    <li>Phone: +254 757 088 427</li>
                                    <li>Working Hours: Monday–Friday, 9 AM–5 PM (EAT)</li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </Layout>
    )
}

export default support

