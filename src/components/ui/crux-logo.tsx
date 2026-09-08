"use client";

import React from 'react';
import { RaiseLogo, RaiseLogoProps } from './raise-logo';

export { RaiseLogo };
export type { RaiseLogoProps };

export const TutorLogo: React.FC<RaiseLogoProps> = (props) => {
  return <RaiseLogo {...props} />;
};

/** @deprecated Use RaiseLogo for user-facing surfaces. */
export const CruxLogo = RaiseLogo;