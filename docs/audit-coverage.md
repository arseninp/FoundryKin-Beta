# Реестр чтения аудита — 2026-11-16

Часть временной передачи: [задачи и ограничения](audit-handoff.md). Прочитать обе части. После закрытия задач перенести постоянные контракты и оставшиеся задачи в основные документы, затем удалить обе временные части и ссылки по согласованию.

## Реестр чтения этой сессии

Полностью получены и прочитаны следующие исходники на базе кода 90852195250b601681489dc927d7501021acb531 / docs-only 40af065edea13708180b1aea56caca5a8ae1630a (это не утверждение о полном тестировании):

Корень: app.html, index.html, preview.html, fk-app.js, fk-editor.js, fk-core.js, fk-grid.js, fk-view.js, fk-tools.js, fk-palettes.mjs, fk-editor-palettes.mjs, fk-settings-picker.js, fk-menu.js, fk-model-state.js, fk-pixel-grid.js, fk-png-viewport.js, fk-png-viewport.css, fk-help.js, fk-log.js, fk-catalog-data.js, preview.mjs, preview-images.mjs, preview-controls.mjs.

catalog/: access.mjs, load.mjs, identity.mjs, resources.mjs, compile.mjs, model-policy.mjs, states.mjs, items.mjs, preview.mjs, prepared-preview.mjs, editor-selection.mjs, editor-comparison.mjs, editor-comparison-controls.mjs, editor-resource-usage.mjs, vanilla-images.mjs, banner-preview.mjs, banner-controls.mjs, leaf-preview.mjs, sign-preview.mjs, cauldron-controls.mjs, fruit-stem-selection.mjs, fruit-stem-preview.mjs, budding-amethyst-selection.mjs.

catalog/rules/: material-families.mjs, dependencies.mjs, forms.mjs, duplicates.mjs.

models/: library.mjs, registry.mjs, textures.mjs, materials.mjs, primitives.mjs, pitcher.mjs.

tools/: validate.mjs, build-family-data.mjs, catalog-families.mjs, catalog-family-paths.test.mjs, check-legacy-successors.mjs, atlas-render-diagnostic.mjs, piglin-visibility.mjs, curation.test.mjs, view-alpha.test.mjs.

.github/workflows/: все восемь — validate.yml, family-data.yml, legacy-check.yml, catalog-audit.yml, catalog-candidate.yml, fix-bamboo-gate-bedrock.yml, piglin-visibility.yml, atlas-render-diagnostic.yml. Чтение YAML не означает чтение всех вызываемых инструментов.

Документы непосредственно перечитаны: CONTEXT.md, TODO.md. Чат №37 на Drive прочитан целиком. Остальные входные документы в ЭТОМ продолжении целиком не перечитаны. README/ARCHITECTURE встречались в поисковой выдаче — не считать полным чтением. Деревья каталогов и результаты поиска также не считать чтением файлов.

### Что НЕ подтверждено полным чтением

Любой отслеживаемый файл вне реестра выше: чтение в этой сессии не подтверждено. Для точного остатка получить git ls-files на текущем HEAD, вычесть этот реестр, отдельно классифицировать исходники, тесты, данные и документы. Не писать проценты покрытия по памяти.

В частности: большинство специализированных models/*.mjs и catalog/rules/*.mjs; fk-i18n.js; CSS кроме fk-png-viewport.css; preview-config.mjs, preview-text.mjs и preview-*-data.mjs; catalog/audit.mjs; большинство tools и тестов, включая compiled-model-fixture.mjs и three-mock.mjs; все сгенерированные data-файлы. Их упоминание в imports не означает чтение.

fk-backup-store.mjs, fk-backup-host.mjs, fk-backups.mjs: полное чтение и 21 локальная проверка заявлены в №37; в текущем продолжении заново целиком НЕ читались. Не выдавать исторические результаты за свежий прогон. Аналогично прежние проверки геометрии и ресурсов не заменяют чтение/выполнение всех тестов после переноса.
