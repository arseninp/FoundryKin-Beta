# TODO — материалы, глазоцвет и интеграция

Обновлено 2026-11-02. Проверенный кодовый HEAD: cc5d4e20ac4ef0ed2c9ab66d955bee8d79154a1c. [x] означает записанную реализацию, не визуальную приёмку. Доказательства и история — CONTEXT.

## Следующий небольшой пакет: подключение материалов

- [x] cc5d4e2: отдельный models/materials.mjs, createModelMaterials с role-based Lambert/Basic и update/dispose.
- [ ] Заново подготовить его подключение к новому preview после отклонённого запроса OLDCHAT15. Текущий preview модуль материалов не импортирует; повторно его создавать не нужно.
- [ ] Проверить descriptor.emissiveRoles, разрешённые bindings, classified textures/userData.semi и совместимость с составными fruit stem/amethyst.
- [ ] Обеспечить обновление текстур и cleanup материалов/геометрии при смене объекта и ошибках. Заимствованные текстуры не освобождать вместе с материалами. Не создавать второй конкурирующий renderer path.
- [ ] После записи проверить полное содержание/diff, затем отдельным пакетом объединить closed/open eyeblossom в одну карточку с выбором «Закрытый / Открытый». Сохранить source IDs, owned ресурсы, saved-ID routes и glow; edit PNG не переключает форму.

Работать небольшими самосогласованными частями. Старый редактор не переключать. Новые постоянные тестовые файлы без отдельного согласования не добавлять; локальные проверки не требуют коммита тестов.

## Уже записано в OLDCHAT15

- [x] 0fa7846/593f918: композиция плод+стебель и связи двух отдельных карточек pumpkin/pumpkin_stem и melon_block/melon_stem. Без стебля — плод, со стеблем — плод и соседний стебель вместе. Варианты тыквы и owned PNG сохраняются.
- [x] f0df125: budding amethyst без нароста либо один выбранной стадии на одной из шести граней; карточки не объединены.
- [x] 18d7077: seagrass short/tall и парные нижние/верхние ресурсы.
- [x] 37d0d48: mangrove propagule ground/hanging, age 0..4.
- [x] 3c8062c: статический kelp-кандидат с шестью исходными путями и сохранёнными animation definitions.
- [x] 5694f16: closed eyeblossom→cross.
- [x] 5720f66: open eyeblossom/firefly bush→emissive_cross, plant/glow и registry emissiveRoles.
- [ ] Настоящие PNG/TGA/UV/WebGL и полная интеграция этих функций; видимые меню ещё не подключены.

## Предыдущий прогресс не начинать заново

Уже записаны azalea/pot/soil, bamboo/ограды/moss, поршни/redstone/fittings, растения/utility/workshop, cauldron/cocoa/daylight/pots/conduit/fire, dripleaf/sculk/cactus/dripstone/ghast/barrel, slime/honey/farmland/snow, cube states/structures/mushrooms/cage. OLDCHAT14: исправленный chorus, cave vines, bulbs/ice/anchor, furnace front normalization, dragon egg, bamboo/shoot, torchflower/crop и stem growth/attached/facing. Подробности — CONTEXT/ARCHITECTURE.

## Проверки и оставшийся scope

- [ ] Полный PIN candidate через существующий coverage/inputValidation; отдельно unresolved/missing builders/normalization/inventory/dependencies/rendering, без нового дублирующего аудита.
- [ ] validate, существующие tests, полный compileModelCatalog и CI; целевые mocks и ожидаемые 103 library types не заменяют эти проверки. Свежего coverage нет.
- [ ] Bindings/stages/indexed repeats/dependencies, aliases/forms/states/icons/carried/saved-ID и обратное открытие стеблей.
- [ ] Bedrock PNG/UV азалии/Java-reference моделей, alpha/WebGL гелей, stem tint, kelp sides/UV/TGA и согласование анимации. A–D kelp не стадии роста.
- [ ] Auxiliary end_gateway/lava_cauldron, block↔item icons и source adapter sign/bed/block entities. Scope согласовать до переключения, unknown не заменять cube.
- [ ] Отдельно разобрать существующие тесты по просьбе владельца; без массового удаления и без обещания автоматической очистки.

## Интеграция и приёмка

- [ ] Перечитать HTML и сохранить рабочий legacy до приёмки; отдельная проверяемая страница с реальными Three/PNG/WebGL, явный admission среза без скрытого ослабления strict compile.
- [ ] Общий объект Find/editor/loaders, корректные материалы, формы/состояния/стадии отдельно от edit slot.
- [ ] EN/RU, Shared textures, role-based icon badges, растущие подписи/design tokens без редизайна бумаги; UX item icon согласовать.
- [ ] Плеер отдельно от state: timing/order, pause при рисовании, экспорт ленты; часы/компас demo cycle.
- [ ] Async targets/transactions/import limits/dimensions/alpha/cache/URL lifecycle и Android draw/undo/redo→Add→reopen→PNG→mcpack, Back/язык/тема/pack-slot-frame switching.
- [ ] Только после приёмки scope переключить HTML/FK_V/cache и удалить заменённый legacy runtime.

Каждая запись — точное системное подтверждение и полная сверка после неё. После обрыва сначала GitHub. Файлы <25000 UTF-8 байт; backup автоматически не обновлять, fk070_packs не очищать. Полные items/entities, IndexedDB, большие паки, пользовательский backup, PWA/offline и права на ресурсы — отдельные этапы.
