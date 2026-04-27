/**
 * weatherService.test.js — Teste unitare Jest
 * ─────────────────────────────────────────────────────────────────────────
 * Testeaza functiile utilitare din weatherService.js (fara apeluri API reale)
 *
 * Rulare: npm test
 * ─────────────────────────────────────────────────────────────────────────
 */

const {
  kelvinToCelsius,
  celsiusToFahrenheit,
  degreesToWindDirection,
  windDirectionDetails,
  interpretDay,
} = require("../backend/weatherService");

// ─────────────────────────────────────────────────────────────────────────
// TESTE: Conversii de temperatura
// ─────────────────────────────────────────────────────────────────────────

describe("Conversii de temperatura", () => {
  describe("kelvinToCelsius()", () => {
    test("0 K = -273.1°C (zero absolut)", () => {
      expect(kelvinToCelsius(0)).toBe(-273.1);
    });

    test("273.15 K = 0°C (punctul de inghet al apei)", () => {
      expect(kelvinToCelsius(273.15)).toBe(0);
    });

    test("373.15 K = 100°C (punctul de fierbere al apei)", () => {
      expect(kelvinToCelsius(373.15)).toBe(100);
    });

    test("293.15 K = 20°C (temperatura camerei)", () => {
      expect(kelvinToCelsius(293.15)).toBe(20);
    });

    test("rezultatul este rotunjit la 1 zecimala", () => {
      const result = kelvinToCelsius(300);
      expect(result).toBe(26.9);
    });
  });

  describe("celsiusToFahrenheit()", () => {
    test("0°C = 32°F (punctul de inghet)", () => {
      expect(celsiusToFahrenheit(0)).toBe(32);
    });

    test("100°C = 212°F (punctul de fierbere)", () => {
      expect(celsiusToFahrenheit(100)).toBe(212);
    });

    test("20°C = 68°F (temperatura camerei)", () => {
      expect(celsiusToFahrenheit(20)).toBe(68);
    });

    test("-40°C = -40°F (punct de echivalenta)", () => {
      expect(celsiusToFahrenheit(-40)).toBe(-40);
    });

    test("37°C = 98.6°F (temperatura corpului)", () => {
      expect(celsiusToFahrenheit(37)).toBe(99);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────
// TESTE: Directia vantului
// ─────────────────────────────────────────────────────────────────────────

describe("Directia vantului", () => {
  describe("degreesToWindDirection()", () => {
    test("0° = nord", () => {
      expect(degreesToWindDirection(0)).toBe("nord");
    });

    test("90° = est", () => {
      expect(degreesToWindDirection(90)).toBe("est");
    });

    test("180° = sud", () => {
      expect(degreesToWindDirection(180)).toBe("sud");
    });

    test("270° = vest", () => {
      expect(degreesToWindDirection(270)).toBe("vest");
    });

    test("360° = nord (echivalent cu 0°)", () => {
      expect(degreesToWindDirection(360)).toBe("nord");
    });

    test("45° = nord-est", () => {
      expect(degreesToWindDirection(45)).toBe("nord-est");
    });

    test("225° = sud-vest", () => {
      expect(degreesToWindDirection(225)).toBe("sud-vest");
    });

    test("undefined returneaza necunoscuta", () => {
      expect(degreesToWindDirection(undefined)).toBe("necunoscuta");
    });

    test("null returneaza necunoscuta", () => {
      expect(degreesToWindDirection(null)).toBe("necunoscuta");
    });
  });

  describe("windDirectionDetails()", () => {
    test("returneaza obiect cu text, emoji si abbr", () => {
      const result = windDirectionDetails(0);
      expect(result).toHaveProperty("text");
      expect(result).toHaveProperty("emoji");
      expect(result).toHaveProperty("abbr");
      expect(result).toHaveProperty("degrees");
    });

    test("nord are abrevierea N", () => {
      const result = windDirectionDetails(0);
      expect(result.abbr).toBe("N");
    });

    test("est are abrevierea E", () => {
      const result = windDirectionDetails(90);
      expect(result.abbr).toBe("E");
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────
// TESTE: Interpretarea zilei
// ─────────────────────────────────────────────────────────────────────────

describe("Interpretarea zilei (interpretDay)", () => {
  const mockClearWarm = {
    tempCelsius: 24,
    humidity: 50,
    windSpeed: 10,
    weatherId: 800,
    description: "cer senin",
  };

  const mockRainy = {
    tempCelsius: 15,
    humidity: 80,
    windSpeed: 20,
    weatherId: 501,
    description: "ploaie moderata",
  };

  const mockThunderstorm = {
    tempCelsius: 18,
    humidity: 90,
    windSpeed: 40,
    weatherId: 201,
    description: "furtuna cu tunete",
  };

  const mockSnow = {
    tempCelsius: -2,
    humidity: 85,
    windSpeed: 15,
    weatherId: 601,
    description: "ninsoare",
  };

  const mockCold = {
    tempCelsius: 5,
    humidity: 60,
    windSpeed: 8,
    weatherId: 800,
    description: "cer senin",
  };

  test("zi frumoasa — senin si cald — nu necesita haina sau umbrela", () => {
    const result = interpretDay(mockClearWarm);
    expect(result.dayType).toBe("frumoasa");
    expect(result.needsCoat).toBe(false);
    expect(result.needsUmbrella).toBe(false);
  });

  test("zi ploioasa — necesita umbrela", () => {
    const result = interpretDay(mockRainy);
    expect(result.needsUmbrella).toBe(true);
  });

  test("furtuna — necesita umbrela si tip zi = furtuna", () => {
    const result = interpretDay(mockThunderstorm);
    expect(result.dayType).toBe("furtuna");
    expect(result.needsUmbrella).toBe(true);
  });

  test("ninsoare — necesita haina obligatoriu", () => {
    const result = interpretDay(mockSnow);
    expect(result.needsCoat).toBe(true);
    expect(result.dayType).toBe("ninge");
  });

  test("rece senin — necesita haina (sub 15 grade)", () => {
    const result = interpretDay(mockCold);
    expect(result.needsCoat).toBe(true);
  });

  test("returneaza intotdeauna emoji si message", () => {
    const result = interpretDay(mockClearWarm);
    expect(result.emoji).toBeTruthy();
    expect(result.message).toBeTruthy();
    expect(result.suggestion).toBeTruthy();
  });

  test("sub zero grade — tip zi inghet", () => {
    const freezing = {
      tempCelsius: -5,
      humidity: 60,
      windSpeed: 5,
      weatherId: 801, 
      description: "innorare usoara",
    };
    const result = interpretDay(freezing);
    expect(result.dayType).toBe("inghet");
    expect(result.needsCoat).toBe(true);
  });
});
