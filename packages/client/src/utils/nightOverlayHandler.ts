import * as Phaser from 'phaser';

enum NightOpacityConstants {
    TIME_OFFSET = 9,
    PERIOD = 12,
    VERTICAL_OFFSET = 0.25,
    AMPLITUDE = 0.25,
    INTERPOLATION_PERCENT = 0.01,
    DEFAULT_OPACITY = 0,
    TIME_OFFSET = 9,
    PERIOD = 12,
    VERTICAL_OFFSET = 0.25,
    AMPLITUDE = 0.25,
    INTERPOLATION_PERCENT = 0.01,
    DEFAULT_OPACITY = 0,
}

/**
 * Calculates the opacity of the night sky based on the current in game time using a sinusoidal function
 * assuming a 12 hour clock cycle.
 * It has a maximum value of 0.5 (for darkest night) and minimum of 0 (for brightest day time).
 *
 * @param currentTime hour in game (0 - 11)
 * @param NightOpacity current target opacity for the night sky overlay
 * @returns    the new target opacity
 */
export function getNightSkyOpacity(currentTime: number, NightOpacity: number) {
    let nextNightOpacity = 0;

    // Determines the opacity of the night overlay on the 12-hour clock cycle
    let sinExp = ((2 * Math.PI) / NightOpacityConstants.PERIOD) * (currentTime - NightOpacityConstants.TIME_OFFSET);
    nextNightOpacity = NightOpacityConstants.AMPLITUDE * Math.sin(sinExp) + NightOpacityConstants.VERTICAL_OFFSET;

    // Smooth transition by slowly approaching the opacity value
    const smoothOpacity = Phaser.Math.Interpolation.Linear(
        [NightOpacity || NightOpacityConstants.DEFAULT_OPACITY,
            nextNightOpacity],
        NightOpacityConstants.INTERPOLATION_PERCENT
    );

    return smoothOpacity;
}
    let nextNightOpacity = 0;

    // Determines the opacity of the night overlay on the 12-hour clock cycle
    let sinExp = ((2 * Math.PI) / NightOpacityConstants.PERIOD) * (currentTime - NightOpacityConstants.TIME_OFFSET);
    nextNightOpacity = NightOpacityConstants.AMPLITUDE * Math.sin(sinExp) + NightOpacityConstants.VERTICAL_OFFSET;

    // Smooth transition by slowly approaching the opacity value
    const smoothOpacity = Phaser.Math.Interpolation.Linear(
        [NightOpacity || NightOpacityConstants.DEFAULT_OPACITY,
            nextNightOpacity],
        NightOpacityConstants.INTERPOLATION_PERCENT
    );

    return smoothOpacity;
}