# ROADMAP — материалы и интеграция

Обновлено 2026-11-02. Проверенный кодовый HEAD cc5d4e20ac4ef0ed2c9ab66d955bee8d79154a1c. Контекст/доказательства — CONTEXT, задачи — TODO, контракты — ARCHITECTURE. Это не выпуск приложения.

## 1. Подключить подготовленные материалы

Композиция плодов со стеблями и optional amethyst уже записаны; не начинать их заново по старым документам. Open eyeblossom/firefly bush имеют plant/glow и требуют unlit glow material. Models/materials.mjs существует, но текущий preview его не подключает.

Первый небольшой пакет — заново подготовить интеграцию материалов в новый путь: role policy, classified textures, обновления и cleanup ошибок/смены объекта, включая составные preview. Не повторять отклонённый запрос вслепую и не создавать второй renderer path. Затем проверить сохранённый результат. Legacy пока не переключать.

## 2. Объединить глазоцвет и закончить модельный scope

Отдельным пакетом одна карточка закрытого/открытого глазоцвета с явным меню, исходными ID/ресурсами и glow открытой формы. PNG не управляет состоянием. Budding amethyst карточки не объединять.

Уже записаны плод+стебель, seagrass short/tall, mangrove propagule ground/hanging и статический kelp. Kelp A–D не стадии роста; точные Bedrock стороны/UV/TGA и анимация требуют проверки. Сохранить все шесть ресурсов и animation definitions, плеер не смешивать с модельным state.

Проверять реальный PIN candidate через существующие coverage/inputValidation, отдельно unresolved/missing builders/normalization/inventory/dependencies/rendering. Свежего остатка нет; старые 78/74 unresolved, 39 sign и ожидаемые 103 library types не являются текущей готовностью. Не создавать дубли аудита.

## 3. Сохранить идентичность и источники

Формы, aliases, состояния, стадии и кадры различать. Pumpkin/melon — две отдельные соответствующие карточки со стеблями; source records/owned PNG сохраняются. Bamboo/shoot и torchflower/crop не aliases. Wall coral fans aliases без mounting; candle cakes объединены с cake с сохранением ресурсов, обычные свечи отдельны. Waxed/infested требуют эквивалентности, oxidation и normal/deepslate остаются раздельными. Unknown не заменять cube.

Sign/bed/block entities требуют общего source/inventory/geometry/material adapter. Entities/cushion/bell отложены; scope согласовать до основного переключения. Путь в inventory или dependency не создаёт карточку.

## 4. Проверяемый новый путь

Сохранить рабочий legacy до приёмки. Отдельная страница с настоящими PNG/Three/WebGL, normalize→compile→access→preview→registry. Admission среза решить явно без скрытого ослабления strict compileModelCatalog. Проверить aliases/forms/states/icons/materials/source-ID reopen, alpha гелей, Bedrock UV азалии и Java-reference моделей, stem tint и ресурсные зависимости.

Локальные проверки выполнять без обязательного сохранения новых тестовых файлов. По просьбе владельца позже отдельно разобрать существующие тесты; не удалять их автоматически. Targeted mocks/исторические прогоны не равны полному compile/CI и визуальной приёмке.

## 5. Интегрировать и принять редактор

Общий объект Find/editor/loaders, независимые state/forms/stages/frames. EN/RU, Shared textures, role-based icon badges, растущие подписи/design tokens без редизайна бумаги. Плеер отдельно от state: timing/order, pause при рисовании, экспорт всей ленты; часы/компас demo cycle. UX item icon согласовать.

Принять async targets/storage transactions/dimensions/alpha/import limits/cache/URL lifecycle и Android draw/undo/redo/Add/reopen/PNG/mcpack. Затем переключить HTML/FK_V/cache и удалить заменённый legacy, не оставляя конкурирующие runtime. HTML в этой передаче не перечитан.

## 6. Темп и дальнейшие этапы

Небольшие самосогласованные пакеты, готовое сразу на точное системное подтверждение; после записи полный diff/контент. После обрыва сначала GitHub. Документы по запросу; числа/сроки/причины обрывов не выдумывать. Файлы <25000 UTF-8 байт. Backup автоматически не обновлять, fk070_packs не очищать.

Полные items/entities, IndexedDB, большие паки, пользовательский backup, PWA/offline и права на ресурсы — отдельные этапы.
