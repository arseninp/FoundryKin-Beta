# Передача — OLDCHAT32 и сохранённый main

Обновлено2026-11-10. CONTEXT первым. Кодовая база перед docs-write: 3f2cf4fc785c171a58036bee06ddd8df4f93dab5. Не релиз и не полная приёмка. Предыдущая база8c26ba7 и прежние технические/модельные контракты сохраняются, кроме явно обновлённого статуса.

## С чего продолжать

Простой Play/Pause: один физический кадр вертикального PNG в секунду, сверху вниз, после последнего первый. Без timing/order из flipbook JSON. Предварительный модуль метаданных не обязательная зависимость. Проигрыватель НЕ записан; последняя проверка подготовки OLDCHAT32 оборвалась из-за тестовой обвязки, не успешный тест.

fr[slot]/fi[slot]/setFrame уже обслуживают ручные кадры и раздельную историю; packCur собирает весь вертикальный PNG. Сохранять этот путь, синхронизировать редактор/preview. Остановка при смене объекта/ресурса, начале рисования, выходе, скрытии и смене/сбросе пака; проверить реальные hooks tools и async invalidation. Без непрерывной отрисовки/частиц/нового renderer. Перед записью законченный пакет и точное подтверждение.

## Реально записано

833e3f9: bubble groups4/4/8/2 по ролям18 bindings. bc0f118: pot Основа/23 рисунка, ghast4 stages0–3 по7 bindings; общий файл в shared_stages, не пятая стадия. Icons отдельно, без duplicate membership. Группы расширяют существующий механизм, не второй каталог.

41bf23b: начальный ракурс восьми model keys в общем view. Сохранённый diff меняет ANGLE_Y внешней stage.group при reset/выходе из flat, а не геометрию до bounds. Полки/подсолнух повторно не компенсировать, scale не менять.

43dcfd2/f245aa6/a804a64/6726278: active/borrowed usage и source-effect/item-icon notes над stage, отдельно от выбора PNG. Старые file/shared lists из справки убраны. Пустой resourceInfo скрыт; reset/cancel/error очищают. Declared icon не любой carried.

7d37e29/0195317: cauldron/lava_cauldron family с исходными IDs/resources, обычный empty/water/colored_water, лавовый empty/lava; сбрасывается только несовместимое content. Подписи water_still_grey/cauldron_water, оба файла сохраняются. Выбор PNG content не меняет, игровая система красителей не заявлена. Существующая UI-test fixture исправлена без удаления утверждений.

57a7e30/f50a901/eec565b: 0–16 слоёв знамени,42 рисунка,16 существующих цветов, перемещение вместе с цветом и удаление из preview. eec565b действительно записан, не повторять из-за неполного ответа. Миниатюры открыты. Ominous готовый sheet, обычные слои сохраняются для возврата; PNG/form/color/layers независимы.

8b8da8a/3f2cf4f: повторное использование active usage и единый обход dependencies для active+borrowed, не постоянный cache/benchmark.

## Не потерять прежнее

Compiled editor/material families/double slabs/frame-history-GPU reuse/items75/observer/signs/cave-vines/hanging controls сохранены. MERS8485bb4 и diagnostics44a5f84, conduit UVbf90910, expectations b89b4b5 не повторять. Пользователь подтвердил conduit/MERS, не побайтовый RGBA/export. Banner50d12e1/3bcf213/da03234/d5a6145 и bubble337f753 реально записаны. Два ошибочных конца OLDCHAT31 исключены, нормализацию пузырей не повторять.

Alias только при полной editor equivalence, family явно сохраняет различия. Частично общая PNG не автоматическое объединение. Source records/IDs/reopen/owned/carried/icons/indexed repeats/dependencies и строгие validators сохранять без ownership transfer. Unknown не cube, неоднозначность не первый PNG.

## Открыто и отложено

Play/Pause, миниатюры, carried бамбука, MERS RGBA round trip, швы/исчезающие поверхности, свежие compile/tests/preview/input validation, real PNG/TGA/WebGL/Android и Find→form/state/resource→draw/history→Add/reopen/export. Профилировать задержки, физически чистить только заменённый legacy, FKCatalog.loadAny сохранить. Каталог вручную до D; после технической части повторный визуальный обход на пропущенные families. Масштаб пока не менять.

Runtime/cache versions и архив старых логов отложены. 1.0.0 не установлена этим пакетом, docs-only не меняет runtime. Перед переносом истории проверить ссылки/CI и сохранить текущие контракты. После блоков перед дальнейшим расширением items планируется глубокий аудит; не объявлять его выполненным и не считать code-map созданной. Full mobs/skin/body/armor/tablet-desktop layout отдельно.

## Проверки и правила

Целевой docs-проход: OLDCHAT32, семь документов, история main, текущие editor-selection/resource-usage/banner-controls/cauldron-controls/fk-core, полные diff a804a64/41bf23b. Это не полный аудит кода/всех diff. Node/приложение/Actions/WebGL/браузер здесь не запускались; старые изолированные проверки не переносить на HEAD.

«Я проверил все ок вроде» — ограниченная пользовательская проверка интерфейса в тот момент, не полный round trip и не приёмка позднейших изменений. Из-за плохого интернета дальнейшие проверки отложены; сейчас ничего присылать/проверять не нужно.

Только main; каждый write точное подтверждение полного содержимого, затем saved diff/content и продолжение до следующего решения/блокера. Новые permanent tests отдельно, текущие не ослаблять. <25000 UTF-8 bytes/file. Бэкап/refactor-0.9/паки/localStorage не трогать, не требовать чистки кэша/повторного оригинального TGA. PIN46ba6ea985fb5a92d79a9419198f10dda14c199d. Ответы кратко по-русски с ясным действием владельца.
