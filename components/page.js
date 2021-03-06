import React from 'react';
import { NextAuth } from 'next-auth/client';

import Layout from '../components/layout';
import { ServiceBaseService } from '../services/service-base/service-base.service';

export default class extends React.Component {
    mBaseService = new ServiceBaseService();

    constructor(props) {
        super(props);
    }

    static async getInitialProps({ req }) {
        return {
            session: await NextAuth.init({ req }), // Add this.props.session to all pages
            lang: 'en', // Add a lang property for accessibility
        };
    }

    adminAcccessOnly() {
        return (
            <Layout {...this.props} navmenu={false}>
                <div className="text-center pt-5 pb-5">
                    <h1 className="display-4 mb-5">Access Denied</h1>
                    <p className="lead">You must be signed in as an administrator to access this page.</p>
                </div>
            </Layout>
        );
    }
}
