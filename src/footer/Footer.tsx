import React from 'react';
import { FooterContainer, FooterRow, FooterColumn } from './FooterStyles';
import { SocialIcon } from 'react-social-icons';

const Footer = () => {
    return (
        <FooterContainer>
            <FooterRow>
                <FooterColumn>
                    <SocialIcon url="https://linkedin.com/in/michael-lavin-2373b7198/" />
                </FooterColumn>
            </FooterRow>
        </FooterContainer>
    );
};

export default Footer;