# Decisiones de diseno

## Dos flujos, un wizard

**Decision:** Un Step 0 global que bifurca en forward o reverse, reutilizando el mismo `StepContainer`.

**Por que:** Ambos flujos comparten infraestructura (animaciones, progress, back nav) pero tienen steps distintos. Un selector inicial evita tabs o navegación extra — el usuario elige una vez y el wizard se arma dinámicamente.

**Constraint:** Los steps se definen como array y se concatenan: `[step0, ...forwardSteps]` o `[step0, ...reverseSteps]`. El `StepContainer` no sabe qué flujo está corriendo.

---

## Reverse como "ingrediente limitante"

**Decision:** El total de vasos es `floor(min(drinksFromPisco, drinksFromBebida, drinksFromIce))`.

**Por que:** En la realidad, el ingrediente que se acaba primero es el que frena. No tiene sentido promediar o asumir proporciones ideales. El floor garantiza vasos completos.

**Constraint:** La opción "Que alcance nomás" para hielo excluye el hielo del `min`, asumiendo suministro infinito. Esto simplifica el input cuando el hielo no es un constraint real.

---

## BottleInput con lockeo de tamaños

**Decision:** Los pills de tamaño se bloquean cuando hay más de una card.

**Por que:** Si el usuario tiene una card de 750ml y otra de 1L, cambiar el tamaño de una a 1L crearía un duplicado sin sentido. Lockear previene estados inválidos sin necesidad de validación extra.

**Constraint:** Para pisco (2 tamaños), la segunda card siempre toma el tamaño restante. Para bebida (4 tamaños), un modal filtra los tamaños ya en uso.

---

## Estado reverse separado del forward

**Decision:** `CalculatorState` tiene un campo `reverse: ReverseState` independiente de `mode`, `peopleCount`, etc.

**Por que:** Los flujos no comparten datos de entrada. Mezclar estado crearía acoplamientos frágiles (ej: `peopleCount` del forward sobreescribiendo el del reverse). Separar permite que `reset()` limpie ambos sin efectos cruzados.

---

## Bebida: modo botellas vs directo

**Decision:** El usuario elige cómo ingresar la bebida: por botellas (cards) o escribiendo litros directamente.

**Por que:** Algunos usuarios saben "tengo 2 botellas de 3L", otros saben "tengo 5 litros en total". Forzar un solo modo agrega fricción innecesaria.

---

## Promos + botellas sueltas: empty state y porcentaje

**Decision:** Cuando el usuario elige "Añadir más botellas sueltas" desde promos, los entries se resetean a `[]` (empty state). Cada botella suelta muestra un selector de porcentaje (100%/75%/50%/25%/personalizado). El porcentaje solo aparece en el path de promos, no en "Por separado".

**Por que:** Si alguien compró promos y además tiene un pisco a medio usar, necesita poder declarar esa botella parcial. Pero en el flow "Por separado" se asume que el usuario está planeando comprar botellas completas, por lo que el porcentaje no aplica. El empty state permite que alguien que solo tiene promos (sin botellas extra de pisco o bebida) no se quede atrapado en un step obligatorio.

**Constraint:** `percentageFull` es opcional en `BottleEntry` (default semántico: 100). El cálculo multiplica `sizeMl * count * (percentageFull ?? 100) / 100`. En este modo cada card es una botella individual (`singleBottleMode`): sin CountPicker, sin lockeo de tamaños, duplicados permitidos — porque el concepto cambia de "grupo de X botellas de un tamaño" a "esta botella específica con su nivel de llenado".

---

## Sin clipboard en reverse

**Decision:** El resultado reverse solo tiene "Empezar de nuevo", sin botón de copiar.

**Por que:** El output del reverse ("te salen 12 vasos") no es una lista de compras — no hay información útil para pegar en un chat. El forward sí lo necesita porque su resultado es actionable ("compra 2 piscos de 1L, 1 bebida de 3L...").
