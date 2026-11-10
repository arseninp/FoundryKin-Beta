# TODO — оставшаяся работа после OLDCHAT30

Обновлено 2026-11-10. Проверенный кодовый HEAD 8c3805b4f58c485308e2cd1bc6142a7565c0e186. [x] — сохранённый код/данные, не полная визуальная приёмка. CONTEXT/handoff читать первыми.

## Уже записано — не повторять

- [x] Compiled editor default и удаление legacy dispatch из active core/view: 0a502af. Физическая чистка не завершена.
- [x] Production material families adb5d5d; editor frames/PNG по изменению 291b5d9; GPU reuse/conditional material update 0f27ede.
- [x] Double slabs a048519 и строгая валидация b82838b: equivalent alias, отличающиеся family form; smooth stone side сохранён.
- [x] Items loader/generator/declared icon sprite selection: 8cd50c9/de36127/449872f.
- [x] Observer powered off/on: b7bf780/6b649d4, общее меню независимо от PNG.
- [x] Workflow dependency paths 5f75486; generated items сохранены 3e698c4. Manifest items:75/items-000.json. Не просить старый лог только потому, что ранее items отсутствовали.
- [x] Standing/wall sign family c92aaa9; cave_vines body/head family c3d8970.
- [x] Hanging sign ceiling/attached/wall controls 8c3805b, default ceiling, geometry/UV не менялись.
- [x] Прежние bed/candles/mechanisms/rails/lightning/power groups/stone/wood/leaf и остальные model hookups сохраняются; не писать повторно.

## Ближайший согласованный участок

- [ ] polished_cinnabar_mers.tga внутри polished cinnabar как дополнительный редактируемый ресурс, без PBR/мерцания. Проверить сохранность каналов/alpha через decode/draw/history/Add/reopen/export ДО объявления готовности. Не отдельная card/не albedo.
- [ ] Затем conduit: неактивный куб выглядит плоско по сообщению владельца; проверить geometry/UV/resources/materials обоих состояний.

## Дефекты и проверка каталога

- [ ] Швы/белые линии и пропадающие поверхности пиглина/сложных моделей: найти старую правку и сопоставить новый renderer. Alpha whole-sheet/inflate/UV — гипотезы, не диагноз.
- [ ] Стартовый разворот подтверждённых голов и других объектов одинаково в карточках/editor; не mirror/UV swap, не глобальные 180°.
- [ ] Котёл water/colored_water: реальные ресурсы и полезность для редактирования, не выдавать за игровой выбор красителя.
- [ ] Bubble_column: pumpkin/resource composition и остальные замечания с учётом объяснения владельца; 18 ресурсов не терять. Общий sprite сохраняется, no-preview не реализовывать.
- [ ] Иконки: сквозное открытие/редактирование/повторное открытие/экспорт на сохранённых items; generated data ещё не полная UI-приёмка.
- [ ] Принять double aliases/family forms/source-ID search/reopen/resources; sign placements/hanging modes; cave vines whole/body/head/berries. Не повторять код подключения.
- [ ] Продолжить пользовательский разбор каталога после D; остальное не считать просмотренным.
- [ ] Масштаб свечей/грибов/ростков/маленьких спрайтов: пока без правок, сначала единое согласованное решение.

## Незавершённые функции

- [ ] Проигрыватель анимаций текстур: play/pause/order/timing, синхронизация модели и экспорт; сначала проверить существующие части. Frame click не playback.
- [ ] Уточнить с владельцем плашки до UI-правки. Shared warning для активной текстуры, конкретные видимые карточки/формы/состояния, зависимости и дедупликация; не весь compiledInfo.shared.
- [ ] Независимая пометка bubble/end: эффект создаёт Minecraft, здесь только исходная текстура. Общий renderer/квадратные cards остаются.
- [ ] Фильтр «Иконки» — будущий этап; адресный вход к icon resource существующей карточки, без второго каталога и пустых результатов.

## Сквозная приёмка и завершение

- [ ] Свежие tests/compile/coverage/inputValidation/полный preview-slice на конкретном SHA. Не переносить старые 697/697 или локальные пакеты OLDCHAT30 на HEAD. Source IDs/expanded bed/auxiliary/cards различать.
- [ ] Real PNG/TGA/WebGL/UV/scale/alpha/Android, async/storage/import/limits/GPU cleanup.
- [ ] Find → family/state/resource → draw/undo/redo → Add → reopen → PNG/mcpack export, включая owned/carried/icons/repeats/borrowed.
- [ ] Оставшаяся задержка около полсекунды по наблюдению владельца: профилировать перестроение/загрузку, не объявлять неизбежной из-за HTML.
- [ ] Удалить подтверждённо заменённый legacy/HTML/exports без потери PNG/TGA loader и без ослабления тестов.
- [ ] Следующее согласованное обновление версии 1.0.0 в интерфейсе/загрузке/cache versioning. В этом docs-only пакете версия не менялась.

## Отложено

Full skin editor/body/armor/full mobs/entities/items/cushion; tablet/desktop layout; IndexedDB/большие паки/user backup/PWA/offline/права на ресурсы. Точные игровые частицы/дым/PBR не обещаны.

Только main, <25000 UTF-8 bytes/file. Точные подтверждения каждой записи, saved diff после; новые permanent tests отдельно согласовать. Бэкап/refactor-0.9/fk070_packs/localStorage не трогать.
