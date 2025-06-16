import { useState, useEffect } from 'react';

type DeviceType =
	| 'mobile'
	| 'tablet'
	| 'desktop'
	| 'large-desktop'
	| 'small-mobile';

interface ResponsiveState {
	deviceType: DeviceType;
	isMobile: boolean;
	isSmallMobile: boolean;
	isTablet: boolean;
	isDesktop: boolean;
	isLargeDesktop: boolean;
	screenWidth: number;
	screenHeight: number;
}

const BREAKPOINTS = {
	smallMobile: 480,
	mobile: 768,
	tablet: 1024,
	desktop: 1440,
	largeDesktop: 1920,
} as const;

export function useResponsiveMobile(): ResponsiveState {
	const [state, setState] = useState<ResponsiveState>(() => {
		if (typeof window === 'undefined') {
			return {
				deviceType: 'desktop',
				isMobile: false,
				isSmallMobile: false,
				isTablet: false,
				isDesktop: true,
				isLargeDesktop: false,
				screenWidth: 1024,
				screenHeight: 768,
			};
		}

		const width = window.innerWidth;
		const height = window.innerHeight;
		const deviceType = getDeviceType(width);
		return {
			deviceType,
			isMobile: deviceType === 'mobile',
			isSmallMobile: deviceType === 'small-mobile',
			isTablet: deviceType === 'tablet',
			isDesktop: deviceType === 'desktop',
			isLargeDesktop: deviceType === 'large-desktop',
			screenWidth: width,
			screenHeight: height,
		};
	});
	useEffect(() => {
		if (typeof window === 'undefined') return;

		let timeoutId: ReturnType<typeof setTimeout>;

		const handleResize = () => {
			// Debounce resize events to improve performance
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				const width = window.innerWidth;
				const height = window.innerHeight;
				const deviceType = getDeviceType(width);
				setState({
					deviceType,
					isMobile: deviceType === 'mobile',
					isSmallMobile: deviceType === 'small-mobile',
					isTablet: deviceType === 'tablet',
					isDesktop: deviceType === 'desktop',
					isLargeDesktop: deviceType === 'large-desktop',
					screenWidth: width,
					screenHeight: height,
				});
			}, 16); // ~60fps
		};

		window.addEventListener('resize', handleResize);

		return () => {
			clearTimeout(timeoutId);
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	return state;
}

function getDeviceType(width: number): DeviceType {
	if (typeof window === 'undefined') return 'desktop';

	if (width < BREAKPOINTS.smallMobile) {
		return 'small-mobile';
	}

	if (width < BREAKPOINTS.mobile) {
		return 'mobile';
	}

	if (width < BREAKPOINTS.tablet) {
		return 'tablet';
	}

	if (width < BREAKPOINTS.desktop) {
		return 'desktop';
	}

	if (width >= BREAKPOINTS.largeDesktop) {
		return 'large-desktop';
	}

	return 'desktop';
}
