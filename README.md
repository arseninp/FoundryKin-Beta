# FoundryKin

Мобильный редактор текстур Minecraft Bedrock: поиск объектов, 3D/спрайт-просмотр, рисование, импорт/экспорт .mcpack.

Приложение: https://arseninp.github.io/FoundryKin-Beta/app.html

## Статус на2026-11-10

Проверенная кодовая точка перед обновлением документов:3f2cf4fc785c171a58036bee06ddd8df4f93dab5. Основной editor compiled; рефакторинг/физическая чистка legacy/полная визуальная приёмка не завершены. Это не выпуск.

Сохранены material families/double slabs/signs/cave vines/hanging mounting/observer, reuse frames/history/GPU textures и PNG encoding по изменению. Items atlas содержит75 записей/items-000.json, declared icons открываются плоско внутри существующих карточек.

MERS polished cinnabar editable без PBR, исходный TGA диагностируется существующим workflow; conduit inactive UV исправлен. Пользователь сообщил, что работают, но RGBA/subsurface alpha и полный export round trip не доказаны.

## Последние изменения

- Знамёна, пузыри, горшок и четыре стадии гаста имеют сворачиваемые группы по declared roles. Исходные ресурсы/IDs сохраняются.
- Active/borrowed usage и effect/item-icon notes находятся над просмотром, отдельно от выбора PNG; прежние file/shared lists удалены из справки.
- Cauldron/lava_cauldron объединены в явную family с безопасным content switching, без потери ресурсов воды/лавы.
- Знамя поддерживает0–16 preview layers,42 рисунка и существующие16 цветов, перестановку/удаление слоёв; PNG не подменяются, ominous готовый sheet сохраняется. Миниатюры пока нет.
- Общий начальный ракурс восьми model keys исправлен без изменения geometry/UV; shared usage обрабатывается одним проходом dependencies без постоянного cache.

## Что осталось

Ближайшее — Play/Pause: один физический кадр вертикального PNG в секунду сверху вниз, после последнего первый, без JSON timing/order. Пока не записан, ручные кадры не проигрыватель. История каждого кадра и полный вертикальный PNG при экспорте должны сохраниться. Последняя подготовочная проверка OLDCHAT32 остановилась в тестовой обвязке, успешные тесты проигрывателя не заявлены.

Открыты миниатюры, carried бамбука, surface defects, MERS channel checks, сквозная приёмка, задержки и legacy cleanup. Масштаб пока не менять. Каталог пользователь просмотрел до D; семьи объявляются явно, частично общая PNG не auto-merge. Подробности в TODO.

## Документы и проверки

Читать CONTEXT → docs/handoff-unified-cards.md → ARCHITECTURE → TODO → ROADMAP → docs/review-principles.md. Предыдущая база8c26ba7; технические/модельные контракты сохраняются, кроме явно обновлённого статуса.

Текущий docs-проход: OLDCHAT32, семь документов, история/целевые модули, полные diff a804a64/41bf23b. Не аудит всех файлов/diff, не исполнение приложения/Node/CI/браузера/WebGL. Пользовательская проверка тогдашнего интерфейса и conduit/MERS не полный RGBA/draw/history/Add/reopen/export. Из-за плохого интернета дальнейшие проверки отложены; сейчас ничего присылать/проверять не нужно.

Версии/cache и архивирование старых логов отложены. Docs-only не устанавливает будущую1.0.0 и не удаляет историю. После блоков перед дальнейшим расширением items планируется глубокий аудит безопасности, ещё не выполненный.

Только main, точное подтверждение каждого write и saved diff/content после, <25000 UTF-8 bytes/file. Бэкап/refactor-0.9/fk070_packs/localStorage не менять/не переносить/не очищать, не требовать чистки кэша. PIN Mojang/bedrock-samples46ba6ea985fb5a92d79a9419198f10dda14c199d, Three.js r128/JSZip3.10.1. Full mobs/skin/body/armor/tablet-desktop layout — будущие этапы.
