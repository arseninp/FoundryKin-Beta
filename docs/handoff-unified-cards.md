# Передача: совмещённые карточки и последующее подключение моделей

Обновлено 2026-11-03 по OLDCHAT20. Проверенный HEAD до документации: efb873044ce59c308bce2aaf11ba73c709d869bf, main. Начать с CONTEXT. Предыдущая полная передача: d41f384; ранняя история: aae3661/40c82f0. Не выпуск/визуальная приёмка.

## Уже записано

Eyeblossom одна card closed/open с cross/emissive_cross/glow; общий FKModelState/FKM/CSS; реальные source records/parent cards/familyDefaults; form/slot/state независимы. Готовые головы/черепа skeleton/wither_skeleton/creeper/zombie/piglin/dragon и четыре стадии статуи/четыре позы подключены к preview, source IDs/reopen сохранены. Полные mobs отложены, не требуются для завершения голов.

Dragon использует textures/entity/dragon/dragon, 256x256 sheet, 6 head cubes + jaw/mirror UV/static closed jaw через skull. Не textures/entity/enderdragon/dragon, не новая PNG головы. Bedrock placement/scale/UV не приняты. Статуе не добавлять автоматически глаза/цветок; waxed routes сохранять, окисления не сливать. Rotation/facing меню голов/статуй не нужно, есть жест.

OLDCHAT20 продолжил работу после голов:
- 70ec5f8/1fcf149/56724d3: decorated pot resources, 23 узора + обычная сторона, независимые четыре стороны в существующих builder/resolver/общем picker. Корпус/горловина/UV сохранены, PNG отдельно.
- cdac9c4/93b9565/eb3fa90/5eeed20: шесть ресурсов conduit, статичный active Java-reference-кандидат, resolver и общий picker активности/глаза/вихря. Default inactive; нет анимации/слежения глаза.
- 5eeed20: controls вынесены в preview-controls.mjs без второй реализации; root preview сохраняет экспорты проверок.
- df07052/ae7120e: existing preview-slice workflow дополнен горшком/conduit. Успешный Actions не подтверждён.
- efb8730: water/lava builders и четыре назначения уже записаны.

## Точка продолжения

Срез сейчас 29 source block IDs, не cards/весь каталог: прежние 27 плюс pot/conduit. Вода/лава в него ещё не включены. Изучить normalization/bindings/resolver/materials/controls и подключить существующие жидкости небольшим пакетом без повторения geometry. liquids.mjs: level 0..7/default 0, высота (8-level)/9, шесть ролей, lava emissive. Не simulator: нет neighbour slopes/falling/tint/overlays/timing; Bedrock render не принят.

Предварительный остаток без назначения после жидкостей — bell/player_head/bubble_column по архивной сверке, не свежий coverage/согласование нового scope. Fire уже существует; плеер отдельная задача. Макет tablet/desktop остаётся открытым, его не исследовали до конца, редизайн не согласован.

## Границы и сохранность

Исходные IDs/records/resources/reopen и реальные разные PNG не терять. Общая PNG не alias; form/slot/state/pose независимы, sheets без копий/обрезки. Не показывать готовый Mob без модели. Полные entities отложены. Общие обязанности/потребители, не второй каталог/панели/цепочки обёрток.

Исторические mocks/изолированные проверки не full chain/реальные PNG-TGA/WebGL/Android/export. В этом проходе читались чат, семь документов, 15 коммитов, root preview/liquids; тесты/compile/CI/браузер не запускались. Числа проверок не суммировать. Исключённую реплику OLDCHAT19 не превращать в баги. Только main/точное подтверждение/saved diff, новые test files отдельно согласовать; backup/fk070_packs не трогать. Остальные правила — CONTEXT.
