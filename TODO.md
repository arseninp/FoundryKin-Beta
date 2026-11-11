# TODO — после подключения расширенной диагностики

Обновлено 2026-11-11. Кодовая точка: b72d42176609a239e7e01894a2cf52a86ce5f6ff; сохранённые diff проверены, не сквозной запуск HEAD. CONTEXT.md — источник актуального статуса; прежние документы сохраняют технические контракты. [x] означает записанный код, не полную браузерную/CI-приёмку.

## Уже записано — не повторять

- [x] Compiled editor/families, кадры с отдельной историей и полным PNG, GPU reuse; legacy cleanup не завершена.
- [x] Double slabs со строгими validators/smooth stone side; items loader/generator/icons и atlas75, observer, signs/cave vines/hanging. Подробные SHA в CONTEXT.
- [x] MERS без PBR, TGA diagnostics, conduit UV. Пользовательское подтверждение не полный RGBA/export.
- [x] Banner/bubble/pot/ghast resource groups; пузыри18 без pumpkin_side, горшок23 рисунка, гаст ровно4 стадии. Cauldron family и подписи воды.
- [x] Resource info над stage, usage owners/dependencies без ownership transfer, пояснения эффектов, лишние file/shared lists из справки убраны.
- [x] Слои знамени0–16, move/remove вместе с цветом,42 рисунка/16 цветов, ominous с сохранением настроек.
- [x] Play/Pause702f28a и тесты7b10d0d: физические кадры раз в секунду, не JSON timing/order; не реализовывать повторно.
- [x] Ленивые миниатюры рисунков32ef4d1/2b33040, общий picker, максимум2 загрузки.
- [x] Пометка • icon840a451 в смешанных наборах; бамбук — пример, не доказанный дефект модели/carried.
- [x] Три тона7edbcc2/8e10b33/9053a2b, панели и перенос названий без лимита строк; явная кнопка Textures0dd5307.
- [x] FKLog создан5f3be69, доработан84b04ac и подключён6391cde; существующий отчёт расширенb72d421. Это записанный код, не полная приёмка.
- [x] mkFile77bd1fb: явная проверка заголовка без fallback16x16; не полный PNG decode.
- [x] fk-core94a1185: per-file isolation, rejected-реестр, запрет ванильной подмены, FKAPI.diagnostics().

## Расширенная диагностика — записано, не повторять

- [x] 84b04ac: ограниченный FKLog/очистка полей, удаление дублирующего inspector; mkFile не менялся. Не универсальный DLP.
- [x] 7520b15: события каталога/пака/выбора/ошибок и callback createImageSource; saved/vanilla/path/этап/duration/размеры при наличии. Отказ preview фиксируется в previewCompiled, fk-grid.js не менялся.
- [x] 6391cde: подключения shell/iframe, FKE.info передаёт rejected/счётчик/журнал/catalogError; ошибки диагностики изолированы.
- [x] b72d421: существующий отчёт, до40 rejected и60 событий каждого документа, до100000 символов плюс отметка. Копирование/обновление сохранены; storage только чтение, без fk_t. Без PNG/содержимого паков и автоматической отправки в диагностических call sites.
- [x] Временные проверки до пакетов:24 logger/image-source;16 core VM;13 bridge VM плюс4 HTML;15 full app VM; синтаксис. Точные области/моки в CONTEXT. Новых permanent tests нет; не сумма с историческими и не единый запуск HEAD.
- [ ] Независимая сквозная проверка окончательной связки и real PNG/TGA/browser/WebGL/Android/CI остаётся. Пользователю сейчас не требовать повторной браузерной проверки; принятый заголовок не успешный decode/целостность PNG.

## Периодический сбой и приёмка

- [ ] Первопричина реального acacia_shelf НЕ установлена. Найдены дефект разбора заголовка и путь остановки каталога; не объявлять доказанной порчу данных пользователя/превышение лимита/ошибку модели.
- [ ] Пользователь2026-11-11: сейчас загружается нормально, но сбой периодический. Не считать закрытой браузерной приёмкой; сейчас повторной проверки не просить.
- [ ] При повторении собрать конкретный отчёт. Не требовать очистки кэша/паков или многократных случайных воспроизведений.
- [x] Исторически перед77bd1fb/94a1185 были19 isolated mkFile checks и16 core VM с mocked DOM/reader; не переносить их на HEAD и не смешивать с диагностическими проверками выше.

## Макет и оставшиеся технические задачи

- [ ] Подписи Preview/Textures редактора, выравнивание Shared texture, тёмная палитра из макета. Back red#866065 лишь предложение. Единый компонент всех кнопок не завершён.
- [ ] MERS decode/draw/history/Add/reopen/export с RGBA/subsurface alpha; не запрашивать оригинальный TGA повторно.
- [ ] Швы/белые линии/исчезающие поверхности: alpha/inflate/UV — гипотезы, не global opaque/DoubleSide.
- [ ] Сквозные families/aliases/source-ID/reopen/sign/hanging/cave-vines/borrowed и Find→draw/undo/redo→Add→reopen→PNG/mcpack.
- [ ] Свежие compile/tests/coverage/inputValidation/preview-slice на точном SHA; real PNG/TGA/WebGL/Android, async/storage/import/limits/GPU cleanup, профилирование задержек.
- [ ] Каталог после D и повторный обход на пропущенные families; совпадение части PNG не auto-merge. Масштаб пока не менять.
- [ ] Удалять только подтверждённо заменённый legacy, сохранить PNG/TGA loader/validators.

## Отложено и правила

Версии/cache (runtime0.9.1,1.0.0 ещё не установлен), архив старой истории, code-map и будущий аудит безопасности после блоков/перед догрузкой items. Старые логи не удалять. Mobs/skin/body/armor/tablet-desktop/IndexedDB/большие паки/PWA/offline — будущие этапы.

Только main, один каталог/runtime/picker/menu/index, каждый файл <25000 UTF-8 bytes. Внешний write — точное системное подтверждение всего пакета, затем saved diff/content и продолжение без ожидания очередного «давай дальше». Новые permanent tests отдельно согласовать, существующие не ослаблять. Backup/refactor-0.9/fk070_packs/localStorage не менять/не переносить/не очищать. Кратко по-русски; ничего проверять/присылать от пользователя сейчас не требуется.
