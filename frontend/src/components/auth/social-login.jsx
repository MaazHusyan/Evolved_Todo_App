"use client";

import PropTypes from 'prop-types';
import { Github } from 'lucide-react';

/**
 * SocialLogin Component
 * Glass-styled buttons for OAuth social login providers
 * Currently UI-only, backend integration to be added later
 */
export function SocialLogin({ onGoogleClick, onGithubClick }) {
  const providers = [
    {
      name: 'Google',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      ),
      onClick: onGoogleClick,
      gradient: 'from-red-500 to-yellow-500',
    },
    {
      name: 'GitHub',
      icon: <Github className="w-5 h-5" />,
      onClick: onGithubClick,
      gradient: 'from-gray-700 to-gray-900',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {providers.map((provider) => (
        <button
          key={provider.name}
          type="button"
          onClick={provider.onClick}
          className={`
            glass-input
            flex items-center justify-center gap-2
            px-4 py-3
            text-sm font-medium text-gray-700 dark:text-gray-300
            hover:scale-105 hover:shadow-lg
            transition-all duration-300
            group
          `}
          aria-label={`Sign in with ${provider.name}`}
        >
          <span className={`bg-gradient-to-r ${provider.gradient} bg-clip-text text-transparent group-hover:scale-110 transition-transform`}>
            {provider.icon}
          </span>
          <span>{provider.name}</span>
        </button>
      ))}
    </div>
  );
}

SocialLogin.propTypes = {
  onGoogleClick: PropTypes.func,
  onGithubClick: PropTypes.func,
};

SocialLogin.defaultProps = {
  onGoogleClick: () => console.log('Google login clicked (not implemented)'),
  onGithubClick: () => console.log('GitHub login clicked (not implemented)'),
};
