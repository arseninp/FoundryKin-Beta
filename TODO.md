# TODO — оставшаяся работа после OLDCHAT31

Обновлено 2026-11-10. Проверенный HEAD 337f7537ccdad52ff828d70bcb7f20fcd4347f55. [x] — сохранённый код/данные, не полный CI или визуальная приёмка. CONTEXT/handoff первыми. Прежние контракты dc73611 сохраняются.

## Уже записано — не повторять

- [x] Compiled editor/удаление active legacy dispatch 0a502af; material families adb5d5d; frames/history/PNG291b5d9; GPU reuse0f27ede. Физическая чистка не завершена.
- [x] Double slab aliases/forms a048519+b82838b со строгой валидацией и smooth stone side.
- [x] Items loader/generator/icon sprite 8cd50c9/de36127/449872f; generated items3e698c4, 75 записей. Observer off/on b7bf780/6b649d4.
- [x] Standing/wall sign c92aaa9; cave vines c3d8970; hanging mounting8c3805b.
- [x] MERS editable binding8485bb4 без PBR; TGA diagnostic workflow44a5f84. Полная сохранность каналов ещё не доказана.
- [x] Conduit inactive vertical UVbf90910; точные тестовые ожидания MERS/sign labels b89b4b5. Владелец подтвердил работу conduit/MERS, не требовать повтор той же проверки без новых изменений.
- [x] Banner standing/wall family и исключение fallback досок50d12e1; 42 рисунка/исходные IDs/ресурсы сохранены.
- [x] Banner resource groups3bcf213; заголовки/illager в Основе da03234; snap(k) dimensions cv[k] восстановлены d5a6145.
- [x] Bubble рабочие18 declared resources без pumpkin_side337f753, provenance/icons/carried сохранены. Полный diff прочитан. Это не UI-группировка.
- [x] Прежние bed/candles/mechanisms/rails/power/stone/wood/leaf и другие hookups сохраняются, не повторять готовую геометрию.

## Ближайшее продолжение

- [ ] Подключить осмысленные сворачиваемые группы ресурсов bubble_column через существующий resourceGroups/declared roles. Нормализацию337f753 не записывать повторно.
- [ ] Изучить другие длинные списки для того же механизма: рисунки горшка, стадии высушенного гаста. Не группировать автоматически весь каталог, не угадывать по filenames.
- [ ] Визуально принять итог заголовков banner после da03234/d5a6145 при подходящем UI-пакете; старое положительное впечатление от меню не выдавать за полный финальный тест.
- [ ] Общий начальный разворот cards/editor для подтверждённых восьми групп: головы, statue, dried ghast, chests, banners, big dripleaf, tripwire hook, signs/hanging signs. Сначала сверить фактический код; не global180/mirror/UV swap, не повторно компенсировать полки/подсолнух.

## Ресурсы, дефекты и макет

- [ ] MERS: установить результат существующей TGA диагностики и отдельно проверить фактический decode/draw/history/Add/reopen/export с сохранением RGBA/alpha. Не требовать повторно исходный TGA через чат.
- [ ] Знамёна: удобная явная примерка рисунка, миниатюры и управление слоями пока не завершены. Edited PNG независим от просмотра. Новую палитру/16 цветных PNG не добавлять.
- [ ] Item-значок в будущем макете: предметная иконка отдельно различима от model texture, плоско без вращения, ресурс той же карточки. Проверить семантику carried бамбука, не только надпись.
- [ ] Швы/белые линии/пропадающие поверхности: alpha/inflate/UV пока гипотезы, не глобальные opaque/DoubleSide.
- [ ] Cauldron water/colored_water: реальные ресурсы и смысл, без обещания игрового красителя.
- [ ] Иконки, double forms/aliases, source-ID search/reopen, sign/hanging/cave-vines modes — сквозная приёмка, не повтор подключения.
- [ ] Продолжить пользовательский каталог после D. Полное чтение builders не означает визуального обхода всех карточек.
- [ ] Масштаб маленьких объектов пока не менять; сначала единое решение.

## Незавершённые функции

- [ ] Animation play/pause/order/timing/model sync/export; frame click не playback.
- [ ] Shared-плашка для активного файла с конкретными visible cards/forms/states/dependencies без дублей; содержание уточнить до UI-правки.
- [ ] Пометка bubble/end: Minecraft создаёт эффект, здесь редактируемая исходная текстура. Sprite/WebGL и квадратная сетка сохраняются, no-preview отклонён.
- [ ] Icons filter — адресный вход к ресурсу существующей карточки, не второй каталог.

## Сквозная приёмка и завершение

- [ ] Свежие tests/compile/coverage/inputValidation/полный preview-slice на конкретном SHA. Старые697/697 и локальные проверки не статус HEAD.
- [ ] Real PNG/TGA/WebGL/UV/scale/alpha/Android, async/storage/import/limits/GPU cleanup.
- [ ] Find→family/state/resource→draw/undo/redo→Add→reopen→PNG/mcpack export, owned/carried/icons/repeats/borrowed.
- [ ] Профилировать остаточные задержки, не обещать ускорение от сворачивания без измерений.
- [ ] Удалять подтверждённо заменённый legacy/HTML/exports, сохранить PNG/TGA loader, validators не ослаблять.
- [ ] Runtime/cache versioning1.0.0 отдельным согласованным пакетом, не docs-only.

## Правила и отложенное

Два последних ответа OLDCHAT31 не использовать. Bubble337f753 реально сохранён. В каждом ответе ясно писать, нужно ли владельцу проверять/присылать что-либо. Не превращать ожидание CI в просьбу проверять приложение.

Full mobs/skin/body/armor/entities/items/cushion/tablet-desktop layout/IndexedDB/большие паки/user backup/PWA/offline/права — отдельные будущие этапы. Точные particles/smoke/PBR не обещаны.

Только main, <25000 UTF-8 bytes/file, точное подтверждение каждого write, saved diff после. Новые permanent tests отдельно согласовать. Бэкап/refactor-0.9/fk070_packs/localStorage не трогать.
