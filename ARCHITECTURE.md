# ARCHITECTURE — 2026-11-15

База: 4ad5e7b9de9a581bb22080195959a9b0abb6c558/main. index0.9.24, app/FK_V0.9.20, preview0.9.9. Статусы — CONTEXT/TODO. Подробные прежние модельные, ресурсные, backup и диагностические контракты обязательны по ARCHITECTURE.md на 7b20a159304447d7102c7698ace284704fbbae4a и 30b51e2be09edb90082687af99d98b7bca470cc8, кроме явно обновлённых здесь статусов. Это не полный новый аудит.

## Путь и инварианты

app.html → fk-app/fk-editor → iframe index.html → compiled editor. Legacy dispatch/FKShapes.build не рабочий путь; физическая чистка scripts/exports не завершена, FKCatalog.loadAny нужен PNG/TGA.

PIN46ba6ea985fb5a92d79a9419198f10dda14c199d → load/assemble → normalize/resources/icons/aliases/states/families → compile/access/resolver → registry/materials/textures → scene. Не ослаблять hashes/count/conflict/path validators; unknown не cube/первая PNG. Record/source-ID/card/form/state/slot/reopen различать. Alias только полная editor equivalence, family явно; owned/borrowed/indexed/repeats/dependencies сохранять. Выбор PNG не управляет состоянием/формой/pose.

catalog/editor-selection отвечает за selection/reopen/search/resource/frame preparation; editor-resource-usage — read-only usage. fk-core владеет async tokens/pack/history/cv/fr/fi. prepared-preview — material requests/instances/update/dispose; models/materials/textures — owned GPU resources и borrowed canvases. Один renderer/picker/menu, не постоянный render loop. Async discard/rollback/retry/limits/cleanup и reuse GPU по размеру сохранять.

## Количество моделей — новый путь

961199f → ed78bca → 4b057b5 → 4ad5e7b. fk-model-state предоставляет количество в существующем меню формы; fk-core связывает выбор с текущим просмотром; fk-view строит и размещает повторы. Допустимы только 1/3/9, неправильное значение отклоняется.

Stage хранит instance/copies/count/modelSize. Центральная prepared instance владеет ресурсами. Копии base.clone(true) заимствуют geometry/materials/textures; clear сначала снимает копии, затем dispose владельца ровно по его lifecycle. update вызывается для исходной instance, общие материалы/текстуры обновляют повторы.

3×1: x=-1,0,1; 3×3 добавляет второй ряд координат -1,0,1. Объёмный preview — XZ, sprite — XY. Шаг 1, без подгонки по bounds, масштабирования геометрии или маскировки пустот формы. fit меняет кадрирование ортографической камеры под группу. setCopies не rebuild модели; arrange откатывает копии/count при ошибке. capture каталога принудительно count:1. Количество не данные пака/Undo; переключение не должно останавливать playback. Реальный WebGL/Android не проверен этой сессией.

## Настройки и палитры

Настройки: Персонализация (тема/язык/палитры), Память, Справка, Диагностика, О приложении. Тон2/описание, кнопка тон3, стрелки. Выбор темы/языка тематический и применяется сразу без ОК, опасные операции сохраняют подтверждение. Это не завершённая общая UI-система.

fk-palettes.mjs предоставляет createPaletteStore/paintPaletteSample/PALETTE_KEY; fk-editor-palettes.mjs использует тот же store и общий FKM. fk-tools остаётся владельцем цвета кисти/инструментов и recent history. Состояние наборов отделено от паков/backupEntries; текущая выгрузка паков и внутренние снимки не объявлены экспортом палитр.

Mix/Микс — прежняя автоматически пополняемая история fk_hist, до20 RGBA hex8. Одинаковый RGB с другой alpha — другой цвет. Личные именованные наборы не пополняются автоматически. Персонализация позволяет создавать/именовать/менять HEX/RGBA/удалять. Редактор позволяет выбирать и сохранять набор через удержание значка: копия текущих цветов, включая alpha, без очистки Mix/переключения кисти/набора. Для Mix доступна очистка, для его образца удаление. Ошибка записи сохраняет прежние данные/введённое имя; hold не должен вызвать обычный click. Переключение набора само цвет кисти не выбирает.

fe20428 заменил промежуточные c91a864/b775745. Статические стили в fk-editor-palettes.css; старые правила index и внедряемый JS style удалены. CSS grid/маски вместо кармана/накрывающих псевдоэлементов/ResizeObserver. Полное название, неподвижная кнопка, лента входит в её область, справа мягкий край; полоса скрыта при сохранённой прокрутке. Внешний вид принят владельцем, не все storage-сценарии.

Canvas display-only решение Samsung сохранять: swatches/preview/tracks рисуются пикселями с alpha-композицией на шахматке, исходные RGBA/HEX/PNG не компенсируются. color=null до явного выбора; picker draft/open/cancel не выбор. Pen/fill/swap без цвета не создают Undo/пикселей, erase/pick независимы; очистка истории не сбрасывает кисть.

## До/после и PNG viewport

editor-comparison хранит baseline первого входа ресурса/всех подготовленных кадров с текущим паком, не vanilla/Undo. Новые загрузки учитывают async token, повторный remember baseline не меняет. Reset/error/cancel сбрасывают сравнение. Сохранение внутри карточки baseline не переопределяет.

Player слева, compare справа. Shown canvases переключают PNG и модель через общий update, сохраняя fi/таймер/ракурс; playback разрешён в До. Редактирование только в После на паузе через ctx.ready, просмотр и pan/zoom через ctx.viewReady. Красная рамка через aria-pressed/:has, не новый независимый флаг.

PNG viewport перемещает существующий canvas#ed внутри panel/clip/surface, сетка в той же системе; не второй холст данных. Free mode блокирует кисть и даёт drag/pinch/wheel/клавиатуру; zoom .25..256 относительно fit. Reset fit не меняет pixels/Undo; смена ресурса/размеров сбрасывает вид/free mode, resize сохраняет относительный центр. Точность на всех масштабах не объявлена полностью принятой.

## Материалы и геометрия

Semi true → transparent/alphaTest0/default depthWrite=false; false → opaque/.05/true. Basic sprite/emissive, Lambert прочие; lit/unlit конфликт отклоняется. Registry depthWrite=true для volume skull/statue/bed/chest/shulker/door/sign/banner, own boolean override приоритетен, sprite не наследует volume policy. Role override выше global. Один path с несовместимыми depth/lit policies отклоняется до выделения материалов. Borrowed textures не освобождать через dispose материалов. Не переносить policy на всё стекло/liquids/fire/slime/honey.

Пиглин: HEAD_INFLATE и -0.02 удалены, прямые размеры/16, центры/UV/уши сохранены. Statue лишние -0.01 удалены, повороты сохранены. Moss/decal/flame-plane правки не доказывают устранение всех швов. Не глобальные scale/opaque/DoubleSide/depthWrite/rounding/pixel snapping. Намеренные слои player hat0.5 и source-derived дроби potted azalea не мусор. Азалия composeShape с принятым упрощённым Java-reference видом, не точная Bedrock-копия. Начальный ракурс восьми keys через внешнюю stage.group, не смена UV/геометрии, ручной ракурс сохранять.

## Внутренние бэкапы

fk-backup-store: schema1/packId/name/createdAt/pack, один слот, структура/типы/уникальность путей/PNG prefix; это не decode/CRC. Store replace не UI-замена. fk-backup-host хранит логические записи в data.backupEntries единого fk070_packs, без миграции/автозаписи/IndexedDB. Commit сначала storage, потом live state.

fk-backups: карточки списка паков, не прежний блок страницы текстур. Имя/дата, Текстуры, затем Create либо Restore/Delete тон3 пополам. Создание отдельным экраном, необязательное имя, постоянное красное предупреждение; успех назад/плашка, ошибка сохраняет форму. Перед восстановлением Image decode с пределами16384/16777216 и проверкой async identity/generation/current screen; заменяется только выбранный пак, снимок остаётся. Удаление пака/общая очистка предупреждают о снимках. Палитры/настройки/несохранённый мазок не входят. Реальный quota/reopen/export round trip не подтверждён целиком.

## Ресурсные контракты, не ослаблять

Сохранить полные sheets/bindings.sheet, skull source.definition и настоящие sheets/icons вместо soul_sand fallback; banner42 patterns/0–16 layers/16 цветов и порядок с цветом, signs13 пород/placement/hanging, bed16/9 частей, chest11/open/double с исключением ender, shulker17/open. Сохранить groups declared roles без duplicate membership, borrowed ownership и dependencies, cave-vine parts/berries, cauldron content, fruit+stem, один budding-amethyst нарост, eyeblossom closed/open/glow. Kelp A–D не стадии роста. Items optional и строгие hashes/repeats; historical counts не свежий coverage. MERS explicit texture_set без PBR/суффиксных догадок. Подробные UV/стадии/indexed/parts/validators — в указанной исторической ARCHITECTURE, не отменены.

## Диагностика и дальнейшая унификация

FKLog → существующий s-diag: bounded memory, до400 events, отчёт40 rejected/60 events документа/100000 символов с отметкой. Без PNG/pack content/автоотправки/storage writes; не универсальный DLP. mkFile проверяет signature/IHDR/data URL и пределы, не decode/CRC; rejected ресурсы не подменять молча vanilla. acacia_shelf первопричина не доказана.

5c5f12b/7c34ded удалили видимую приставку v, не технические ?v=. Версии пока вручную расходятся, описание устарело. На UI-рефакторинг: один источник версии, общие компоненты/стили, скрытые полосы во всех областях без отключения прокрутки, автовозврат texture/pack settings только после успеха. Общий построитель ещё не выполнен. Обучение отложено до аккаунтов/клиентской базы. Точный Pages SHA/свежий полный CI/безопасность/производительность/legacy cleanup остаются открыты; docs-only ничего из этого не доказывает.
