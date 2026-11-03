# CONTEXT — вход новому чату

Обновлено 2026-11-03. arseninp/FoundryKin-Beta, main. Проверенный кодовый HEAD перед документальной записью: d7fb21715a633ccd61a4caf7ca78373e1289aa2a. Это не выпуск: рефакторинг и блоковый этап не завершены.

## Точка остановки

Прочитан полный OLDCHAT17 на Диске, все шесть документов и последние 20 коммитов. История подтверждает запись пакетов ниже. Исходники этих пакетов в этой передаче заново не проверялись; тесты, синтаксические проверки, полный compile, CI, PNG/TGA, Three/WebGL и Android не запускались. Локальные проверки из архива — исторические сообщения, не свежий результат.

Последняя запись d7fb217 добавляет геометрию статуи медного голема: standing, sitting, running, star. Подключение источников текстур и карточек статуй ещё НЕ записано. Следующая задача — привязать статуи к существующим entity-листам четырёх степеней окисления, не копируя PNG, сохраняя исходные ID и отдельные стадии. Нужность слоя глаз для блока-статуи выяснить по источнику, не переносить его автоматически из entity. Геометрическую основу затем переиспользовать для entity медного голема, не создавать вторую копию. Это решение владельца, не завершённый импорт entities.

## Приоритеты владельца

1. Сначала перенос оставшихся моделей и технической основы: источники, bindings, состояния, карточки, saved IDs и связи.
2. После сборки согласованного объёма — совместная проверка нового пути, реальных изображений, WebGL, редактора и экспорта.
3. После успеха — удаление ненужных, дублирующих и заменённых частей.
4. Только после готовности/приёмки новой основы — удаление дорефакторной реализации.

OLDCHAT17 повторно закрепил этот порядок. Общий поиск ошибок, техническую чистку и расширение тестовой инфраструктуры отложить; точечные проверки изменяемого поведения сопровождают перенос. Не добавлять новые постоянные test files без отдельного согласования; существующие не удалять массово. Работать малыми самосогласованными пакетами; после сверки записи самостоятельно начинать следующий шаг, но каждая запись требует отдельного точного системного подтверждения. Отвечать коротко по-русски.

## Записано в OLDCHAT17 — не начинать заново

- f1d0922: собственные листы пород обычных/подвесных табличек подключены к source records; ID, прежние ресурсы, icons и states сохранены. Геометрия не менялась.
- 8f6db92: lava_cauldron использует существующий корпус котла с отдельной лавой по умолчанию. Выбор PNG содержимое не переключает.
- 2c2773a: auxiliary end_gateway/lava_cauldron включены во вход нового каталога общей сборкой; проверки manifest/hash/conflicts сохранены по архиву. Preview slice остаётся из 17 исходных ID.
- 8bf072d/6be7c3c: одиночная закрытая модель chest, направления, источники normal/trapped/ender; исходные ID/ресурсы/icons/states сохраняются, типы сундуков не объединяются.
- 1cc08cb: восемь медных ID — четыре стадии и вощёные варианты — используют chest и соответствующие листы; правила waxed routes сохранены.
- ec2a23c: state.double и собственные двойные листы обычного/ловушки/медных сундуков; у ender_chest двойной формы нет.
- 9e0b694: статическое state.open сундуков, крышка и замок вместе, корпус неподвижен; сочетается с facing/double.
- af0a740/881e567: закрытая модель shulker_box из закреплённой геометрии Mojang без головы существа, шесть направлений, неокрашенный и цветные источники, light gray использует shulker_silver; цвета не объединять.
- f76a52e: статическое state.open шалкера с подъёмом/поворотом крышки. Открытая поза — Java-reference кандидат, Bedrock/WebGL не подтверждены.
- d4975ed/ddbf7a3: standing/wall banner geometry candidates и источники базового листа/собственных редактируемых узоров.
- 7fcbd37: canvas-preview знамени — 16 state.color, упорядоченные state.patterns, пересборка при update. По архиву исходные canvas не перезаписываются, окраска ограничена полотном.
- 0ab44ac: state.ominous использует banner_illager без перекрашивания/слоёв; обычные color/patterns сохраняются, отдельной карточки нет.
- d7fb217: четыре позы статуи медного голема и регистрация построителя; источники/карточки статуй ещё не подключены.

Статические open/double/pose и canvas composition не равны плееру или подключённому меню рабочего редактора. Полный compile и реальный WebGL перечисленных пакетов не подтверждены. Число builders не является числом готовых карточек; свежего coverage нет.

## Замечания OLDCHAT17 — ВОЗМОЖНЫЕ проблемы

Это неполный разбор выбранной цепочки, не аудит всего кода и не подтверждённые воспроизведением дефекты. Проверять после сборки согласованного объёма, не превращать в текущие блокеры переноса:

- Асинхронная замена PNG в legacy fk-app.js: возможно обращение по устаревшему индексу после изменения массива.
- Изменение data до успешного сохранения: возможное расхождение памяти и хранилища при ошибке записи.
- imageFrames() в preview.mjs: эвристика вертикальной квадратной ленты может неверно интерпретировать атлас/прямоугольную текстуру.
- Обновление одного кадра через полный набор canvas: возможное лишнее пересоздание GPU-текстур; утечка не доказана.

Подозрение о rotation потолочной таблички СНЯТО в OLDCHAT17 после сравнения с reference: standing/attached используют rotation, ceiling/wall — facing. Не исправлять это вслепую. Сравнение геометрии/UV табличек с acacia reference не доказывает правильность Bedrock PNG/WebGL; review не считать полной визуальной приёмкой.

## Предыдущая записанная основа

OLDCHAT16: df1fcab material instance/composite lifecycle; f03acbe canvas/GPU texture lifecycle; b0e163d отдельный read-only preview.html/preview.mjs для 17 ID; 860e977 workflow preview-slice/95 geometry scenarios; 52cbb88/e776d96 корректировки существующих тестов/userData; e64ef13 loader timeout 20 s/cache 32 записи и 16777216 пикселей/retry. Наличие workflow не доказывает прохождение CI. eb98909/ae5cc41 — полная кровать из девяти частей и 16 цветных источников, bed→red_bed, light_gray→silver. 4448dca — sign geometry standing/wall/hanging, acacia-rs/acacia@750f657 reference, не Mojang export. 450108b — предыдущие документы.

OLDCHAT11–14: potted azalea pot/soil; bamboo/ограды/moss; поршни/redstone/ladder/lectern/lever/shelf; растения/utility/workshop/tracks/metals/hopper/grindstone/frames; cauldron/cocoa/daylight/pots/conduit/fire; dripleaf/sculk/cactus/dripstone/dried ghast/barrel/stage_cross; slime/honey/farmland/snow; indexed cube states/mushrooms/composter/scaffolding/cage. Chorus corruption 5c5f9f4 исправлена 86b6d8f, не текущий блокер. Cave vines/berries, bulb/ice/anchor, furnace front normalization, dragon egg, bamboo/shoot, torchflower/crop, stem stage 0..7/attached/facing уже есть; stem tint открыт.

OLDCHAT15: 0fa7846/593f918 — отдельные pumpkin/melon cards с соответствующим плодом и соседним направленным стеблем; варианты/ID/PNG сохраняются. f0df125 budding amethyst без роста либо один выбранной стадии/грани, growth shared; cards не объединять. 18d7077 seagrass short/tall; 37d0d48 propagule ground/hanging age 0..4; 3c8062c static kelp с шестью ресурсами/animation definitions, A–D не рост. 5694f16 closed eyeblossom cross; 5720f66 open eyeblossom/firefly bush emissive_cross; cc5d4e2 role materials. Объединение closed/open eyeblossom отменено в OLDCHAT16, не возобновлять.

## Контракты и сохранность

Unknown не подменять cube. Aliases/forms/states/stages/frames различать. Edit PNG не управляет геометрией. Сохранять owned paths, carried/icons, исходные индексы/повторы и saved-ID routes. Dependencies разрешают конкретные shared roles без передачи ownership. Wall coral fans aliases без mounting; candle cakes объединены с cake, обычные свечи отдельно. Waxed/infested требуют эквивалентности; oxidation и normal/deepslate не сливать. Использовать stonecutter_block. Принятую legacy geometry/UV, включая repeater/comparator, без конкретного дефекта не переделывать.

Glow — MeshBasicMaterial, sprite unlit, остальные объёмные роли Lambert. Classified textures требуют isTexture и boolean userData.semi: semi→transparent/alphaTest 0/depthWrite false, иначе alphaTest .05/depthWrite true. Материалы заимствуют текстуры; texture layer владеет созданными GPU textures. Composite preview учитывает все части/update/cleanup ошибок.

## Открытый объём

Источники статуй голема — следующий пакет. Далее оставшиеся модели/адаптеры и связи: bindings/dependencies/icons/carried/saved-ID/reopen; Bedrock UV potted azalea/reference-моделей; alpha/WebGL гелей; stem tint; kelp sides/UV/TGA/playback; block↔item icons. Auxiliary вход и lava_cauldron уже записаны, не повторять. Decorated pot без черепков, conduit без active, fire без плеера. Общий entity source/inventory/geometry/material adapter не завершён. Полные entities/cushion/bell отложены; повторное использование геометрии голема согласовано, но не означает переход ко всем entities.

Основной legacy ранее проверен на 0.9.1; app.html/index.html здесь не перечитаны. Preview существует, Pages/реальные PNG/UV/WebGL/приёмка не подтверждены. Сохранить рабочий legacy. Далее общий Find/editor, EN/RU, Shared textures, role-based icon badges, растущие подписи/design tokens без редизайна бумаги. UX item icon не утверждён. Плеер отдельно от state: timing/order, pause при рисовании, export ленты, demo cycle часов/компаса. До удаления legacy принять Android draw/undo/redo/Add/reopen/PNG/mcpack и async/storage/import limits/dimensions/alpha/cache/URL lifecycle; затем синхронизировать FK_V/cache.

## Доказательства и рабочие правила

Архивные mocks/выбранный вход не равны полному compile/CI/WebGL. Не суммировать перекрывающиеся прогоны и не выдавать прежние результаты за новые. Исторические 1275 records/1112 assigned/39 sign missing builder/124–78–74 unresolved устарели; после переносов нужен пересчёт существующими tools/model-coverage.mjs/catalog/audit.mjs, не второй аудит. inputValidation отдельных records не доказывает cards/preview/render. Команды: node tools/validate.mjs; node --test tools/*.test.mjs. Не перекладывать отладку на владельца.

Только main; refactor-0.9 слита/удалена, не воссоздавать. Backup по прежней проверке 304bc4a содержит код 6bd8b58, автоматически не обновлять. fk070_packs — пользовательские localStorage паки; backup кода их не сохраняет, storage ради кэша не очищать. Файлы <25000 UTF-8 байт по ответственности. После записи сверить полный diff/контент, после обрыва сначала GitHub. Вложения/sandbox прошлых ходов не переносятся. Причины сбоев AI неизвестны и не доказывают дефект FoundryKin.

PIN Mojang/bedrock-samples: 46ba6ea985fb5a92d79a9419198f10dda14c199d; candidate в репозитории. Не требовать старые JSON без проверки необходимости, не смешивать выпуски.
