# BeyondCalculator - Calculadora de Piscolas

Calculadora mobile para saber exactamente cuanto pisco, bebida y hielo comprar para tu junta. Ingresa la cantidad de personas, cuantos vasos tomara cada uno y el nivel de pisco, y la app te dice cuantas botellas y kilos de hielo necesitas.

## Tech Stack

- **React Native 0.81** con **Expo SDK 54** (New Architecture habilitada)
- **TypeScript 5.9**
- **Expo Router 6** (file-based routing)
- **NativeWind 4 / TailwindCSS 3** (styling parcial, la mayoria usa `StyleSheet`)
- **React Native Reanimated 4** (animaciones de transicion entre pasos)
- **React Compiler** habilitado via Expo experiments

## Arquitectura

```
app/                  # Screens (Expo Router file-based routing)
  calculator/
    index.tsx         # Pantalla principal - orquesta los 4 pasos
components/
  calculator/         # Componentes especificos de la calculadora
    ModeSelector      # Paso 0: todos lo mismo vs personalizado
    LevelPicker       # Modal de seleccion de nivel de pisco
    GlassSelector     # Paso 2: tipo de vaso (rojo 473ml / vidrio 350ml)
    ResultCard        # Tarjeta de resultado con selector de tamano de botella
    PersonList        # Lista de personas (modo personalizado)
  StepContainer       # Navegacion por pasos con animaciones slide
  countPicker         # Incremento/decremento con input directo
constants/
  drinks.ts           # Ratios de pisco/bebida por nivel, config de vasos
  theme.ts            # Colores del tema
context/
  CalculatorContext    # Estado global de la calculadora (React Context)
types/
  calculator.ts       # Tipos: Mode, DrinkLevel, GlassType, Person, CalculatorState
utils/
  calculations.ts     # Logica de calculo (volumen util, pisco, bebida, hielo)
```

### Flujo de la calculadora (4 pasos)

1. **Modo** - Todos lo mismo o personalizado (auto-avanza al seleccionar)
2. **Datos** - Cantidad de personas, vasos por persona, nivel de pisco
3. **Vaso** - Vaso rojo (473ml) o vaso de vidrio (350ml) (auto-avanza)
4. **Resultado** - Botellas de pisco, bebida y kg de hielo con selector de tamano

### Logica de calculo

- El vaso se llena al 90% (`FILL_RATIO = 0.9`)
- Cada trago desplaza 120ml de hielo (`ICE_ML_PER_DRINK = 120`)
- Volumen util = `vaso * 0.9 - 120ml`
- Niveles: algo piola (20% pisco), normal (30%), "algo piola" (45%)

## Desarrollo

### Requisitos previos

- Node.js 18+
- Expo CLI (`npx expo`)
- Para dispositivo fisico: [Expo Go](https://expo.dev/go) o un [development build](https://docs.expo.dev/develop/development-builds/introduction/)

### Instalacion

```bash
npm install
```

### Iniciar en desarrollo

```bash
npx expo start
```

Opciones disponibles:
- **Android**: `npx expo start --android` o presionar `a` en la terminal
- **iOS**: `npx expo start --ios` o presionar `i` en la terminal
- **Web**: `npx expo start --web` o presionar `w` en la terminal
- **Tunnel**: `npx expo start --tunnel` para compartir el QR via ngrok (util cuando el dispositivo no esta en la misma red)

### Build de produccion

```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

### Linting

```bash
npm run lint
```
