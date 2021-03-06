import assert from 'assert';
import QP from '../src/index';
import helper from './helper';
var plan_Issue1 = require('raw!../test_plans/issue1.sqlplan');
var plan_Issue7 = require('raw!../test_plans/issue7.sqlplan');
var plan_NotShowingSeekPredicates = require('raw!../test_plans/Not showing Seek Predicates.sqlplan');
var plan_KeyLookup = require('raw!../test_plans/KeyLookup.sqlplan');
var plan_ClusteredIndexScan = require('raw!../test_plans/clustered index scan.sqlplan');
var plan_ClusteredIndexSeek = require('raw!../test_plans/clustered index seek.sqlplan');
var plan_QueryPlan293288248 = require('raw!../test_plans/QueryPlan-293288248.sqlplan');
var plan_StmtUseDb = require('raw!../test_plans/StmtUseDb.sqlplan');
var plan_StmtCond = require('raw!../test_plans/StmtCond.sqlplan');
var plan_NestedLoops = require('raw!../test_plans/nested loops.sqlplan');
var plan_MyCommentScoreDistribution = require('raw!../test_plans/stack overflow/my comment score distribution.sqlplan');
var plan_KeysetCursor = require('raw!../test_plans/cursors/keyset Cursor.sqlplan');
var plan_UpvotesForEachTag = require('raw!../test_plans/stack overflow/How many upvotes do I have for each tag.sqlplan');
var plan_Cursor2 = require('raw!../test_plans/cursors/cursor2.sqlplan');
var plan_batchMode = require('raw!../test_plans/batch mode.sqlplan');
var plan_batchModeEstimated = require('raw!../test_plans/batch mode estimated.sqlplan');

describe('qp.js', () => {

    describe('showPlan()', () => {

        it('Adds canvas to .qp-root', () => {
            
            var container = helper.showPlan(plan_Issue1);
            assert.notEqual(null, container.querySelector('svg'));
            
        });
        
        it('Calculates estimated subtree cost correctly', () => {

            var container = helper.showPlan(plan_Issue1);
            assert.equal("0.14839", helper.getProperty(helper.findNodeById(container, "1"), "Estimated Subtree Cost"));
            assert.equal("0.0268975", helper.getProperty(helper.findNodeById(container, "18"), "Estimated Subtree Cost"));

        });

        it('Calculates estimated operator cost correctly', () => {

            var container = helper.showPlan(plan_Issue1);
            assert.equal("0.000001 (0%)", helper.getProperty(helper.findNodeById(container, "0"), "Estimated Operator Cost"));
            assert.equal("0 (0%)", helper.getProperty(helper.findNodeById(container, "1"), "Estimated Operator Cost"));
            assert.equal("0.000025 (0%)", helper.getProperty(helper.findNodeById(container, "3"), "Estimated Operator Cost"));
            assert.equal("0 (0%)", helper.getProperty(helper.findNodeById(container, "4"), "Estimated Operator Cost"));
            assert.equal("0 (0%)", helper.getProperty(helper.findNodeById(container, "5"), "Estimated Operator Cost"));
            assert.equal("0 (0%)", helper.getProperty(helper.findNodeById(container, "6"), "Estimated Operator Cost"));
            assert.equal("0.0032957 (2%)", helper.getProperty(helper.findNodeById(container, "7"), "Estimated Operator Cost"));
            assert.equal("0.03992 (27%)", helper.getProperty(helper.findNodeById(container, "8"), "Estimated Operator Cost"));
            assert.equal("0.0000681 (0%)", helper.getProperty(helper.findNodeById(container, "9"), "Estimated Operator Cost"));
            assert.equal("0.0394237 (27%)", helper.getProperty(helper.findNodeById(container, "10"), "Estimated Operator Cost"));
            assert.equal("0 (0%)", helper.getProperty(helper.findNodeById(container, "11"), "Estimated Operator Cost"));
            assert.equal("0.0000266 (0%)", helper.getProperty(helper.findNodeById(container, "12"), "Estimated Operator Cost"));
            assert.equal("0.0000136 (0%)", helper.getProperty(helper.findNodeById(container, "13"), "Estimated Operator Cost"));
            assert.equal("0.03992 (27%)", helper.getProperty(helper.findNodeById(container, "15"), "Estimated Operator Cost"));
            assert.equal("0.0409408 (28%)", helper.getProperty(helper.findNodeById(container, "16"), "Estimated Operator Cost"));
            assert.equal("0.0268975 (18%)", helper.getProperty(helper.findNodeById(container, "18"), "Estimated Operator Cost"));

        });

        it ('Formats scientific numbers correctly', () => {

            var container = helper.showPlan(plan_Issue1);
            assert.equal("0.000001", helper.getProperty(helper.findNodeById(container, "0"), "Estimated CPU Cost"));
            
        });

        it('Works out cost percentages based on the current statement',  () => {

            var container = helper.showPlan(plan_Issue7);
            assert.equal("248.183 (99%)", helper.getProperty(helper.findNodeById(container, "4", "6"), "Estimated Operator Cost"));
            assert.equal("0.0032831 (100%)", helper.getProperty(helper.findNodeById(container, "3", "11"), "Estimated Operator Cost"));

        });

        it('Shows SetPredicate string in tooltip', () => {

            var container = helper.showPlan(plan_Issue7);
            var clusteredIndexUpdate = helper.findNodeById(container, "0", "6");
            assert.equal('[mcLive].[Cadastre].[OwnerPersonParsed].[Multiword] = [Expr1002]',
                helper.getToolTipSection(clusteredIndexUpdate, 'Predicate'));

        });

        it('Shows predicates in tooltips where necessary', () => {

            var container = helper.showPlan(plan_NotShowingSeekPredicates);
            
            var indexSeekNode = helper.findNodeById(container, "26", "1");
            assert.equal("NOT [SMS].[dbo].[SMSresults].[Note] like 'PENDING%' AND NOT [SMS].[dbo].[SMSresults].[Note] like 'ALLOCATED%'",
                helper.getToolTipSection(indexSeekNode, 'Predicate'));

            var topNode = helper.findNodeById(container, "25", "1");
            assert.equal(null, helper.getToolTipSection(topNode, 'Predicate'));

        });

        it('Shows top expression in tooltips', () => {

            var container = helper.showPlan(plan_NotShowingSeekPredicates);
            var topNode = helper.findNodeById(container, "25", "1");
            assert.equal("(1)", helper.getToolTipSection(topNode, 'Top Expression'));

        });

        it('Shows seek predicates in tooltips', () => {

            var container = helper.showPlan(plan_NotShowingSeekPredicates);

            var topNode = helper.findNodeById(container, "26", "1");
            assert.equal("Seek Keys[1]: Prefix: [SMS].[dbo].[SMSresults].SMSID, [SMS].[dbo].[SMSresults].Status = Scalar Operator([SMS].[dbo].[SMSnew].[SMSID] as [N].[SMSID]), Scalar Operator('S')",
                helper.getToolTipSection(topNode, 'Seek Predicates'));

            var indexSeekNode = helper.findNodeById(container, "4", "1");
            assert.equal("Seek Keys[1]: Start: [SMS].[dbo].[SMSnew].DateStamp < Scalar Operator([@p1]), End: [SMS].[dbo].[SMSnew].DateStamp > Scalar Operator([@p0])",
               helper.getToolTipSection(indexSeekNode, 'Seek Predicates'));

        });

        it('Handles >= and <= seek predicates', () => {

            var container = helper.showPlan(plan_Issue7);

            var clusteredIndexSeekNode = helper.findNodeById(container, "8", "12");
            assert.equal("Seek Keys[1]: Start: [mcLive].[Cadastre].[OwnerPersonParsed].RowId >= Scalar Operator([@MapMIN]), End: [mcLive].[Cadastre].[OwnerPersonParsed].RowId <= Scalar Operator([@ParsedMAX])",
                helper.getToolTipSection(clusteredIndexSeekNode, 'Seek Predicates'));

        });

        it('Shows Key Lookup when Lookup="true"', () => {

            var container = helper.showPlan(plan_KeyLookup);
            
            var keyLookup = helper.findNodeById(container, '5', '1');
            assert.equal('Key Lookup (Clustered)', keyLookup.children[1].innerText);
            assert.equal('Key Lookup', helper.getProperty(keyLookup, 'Physical Operation'));
            assert.equal('Key Lookup', helper.getProperty(keyLookup, 'Logical Operation'));
            assert.equal('Uses a supplied clustering key to lookup on a table that has a clustered index.',
                helper.getDescription(keyLookup));
            assert.notEqual(null, keyLookup.querySelector('.qp-icon-KeyLookup'));

        });

        it('Shows Key Lookup when Lookup="1"', () => {

            var container = helper.showPlan(plan_NotShowingSeekPredicates);

            var keyLookup = helper.findNodeById(container, '6', '1');
            assert.equal('Key Lookup (Clustered)', keyLookup.children[1].innerText);
            assert.equal('Key Lookup', helper.getProperty(keyLookup, 'Physical Operation'));
            assert.equal('Key Lookup', helper.getProperty(keyLookup, 'Logical Operation'));
            assert.equal('Uses a supplied clustering key to lookup on a table that has a clustered index.',
                helper.getDescription(keyLookup));
            assert.notEqual(null, keyLookup.querySelector('.qp-icon-KeyLookup'));

        });

        it('Shows Clustered Index Scan', () => {

            var container = helper.showPlan(plan_ClusteredIndexScan);

            var clusteredIndexScan = helper.findNodeById(container, '0', '1');
            assert.equal('Clustered Index Scan', clusteredIndexScan.children[1].innerText);
            assert.equal('Clustered Index Scan', helper.getProperty(clusteredIndexScan, 'Physical Operation'));
            assert.equal('Clustered Index Scan', helper.getProperty(clusteredIndexScan, 'Logical Operation'));
            assert.equal('Scanning a clustered index, entirely or only a range.',
                helper.getDescription(clusteredIndexScan))
            assert.notEqual(null, clusteredIndexScan.querySelector('.qp-icon-ClusteredIndexScan'));

        });

        it('Shows Clustered Index Seek', () => {

            var container = helper.showPlan(plan_ClusteredIndexSeek);

            var clusteredIndexSeek = helper.findNodeById(container, '0', '1');
            assert.equal('Clustered Index Seek', clusteredIndexSeek.children[1].innerText);
            assert.equal('Clustered Index Seek', helper.getProperty(clusteredIndexSeek, 'Physical Operation'));
            assert.equal('Clustered Index Seek', helper.getProperty(clusteredIndexSeek, 'Logical Operation'));
            assert.equal('Scanning a particular range of rows from a clustered index.',
                helper.getDescription(clusteredIndexSeek))
            assert.notEqual(null, clusteredIndexSeek.querySelector('.qp-icon-ClusteredIndexSeek'));

        });

        it('Has correct icon for Table Valued Functions', () => {

            var container = helper.showPlan(plan_QueryPlan293288248);
            var tableValuedFunction = helper.findNodeById(container, '7', '1');
            assert.notEqual(null, tableValuedFunction.querySelector('.qp-icon-TableValuedFunction'))

        });

        it('Shows StmtUseDb', () => {

            var container = helper.showPlan(plan_StmtUseDb);
            var statementNode = container.querySelector('div[data-statement-id="1"] > div > .qp-node');
            assert.equal('USE DATABASE', statementNode.children[1].innerText);
            assert.equal(null, helper.getProperty(statementNode, 'Physical Operation'));
            assert.equal(null, helper.getProperty(statementNode, 'Logical Operation'));

        });
        
        it('Shows StmtCond', () => {

            var container = helper.showPlan(plan_StmtCond);

            var condNode = container.querySelector('div[data-statement-id="1"] > div > .qp-node');
            assert.equal('COND', condNode.children[1].innerText);
            assert.equal(null, helper.getProperty(condNode, 'Physical Operation'));
            assert.equal(null, helper.getProperty(condNode, 'Logical Operation'));

            var printNode = container.querySelector('div[data-statement-id="2"] > div > .qp-node');
            assert.equal('PRINT', printNode.children[1].innerText);

        });
        
        describe('Tooltip Ordered Property', () => {

            it('Shows True when @Ordered = true', () => {

                var container = helper.showPlan(plan_KeyLookup);
                var indexSeek = helper.findNodeById(container, '3', '1');
                assert.equal('True', helper.getProperty(indexSeek, 'Ordered'));

            });

            it('Shows False when @Ordered = false', () => {

                var container = helper.showPlan(plan_NestedLoops);
                var indexSeek = helper.findNodeById(container, '3', '1');
                assert.equal('False', helper.getProperty(indexSeek, 'Ordered'));

            });

            it('Shows True when @Ordered = 1', () => {

                var container = helper.showPlan(plan_Issue1);
                var indexSeek = helper.findNodeById(container, '7', '1');
                assert.equal('True', helper.getProperty(indexSeek, 'Ordered'));

            });

            it('Shows False when @Ordered = 0', () => {

                var container = helper.showPlan(plan_Issue7);
                var indexSeek = helper.findNodeById(container, '2', '10');
                assert.equal('False', helper.getProperty(indexSeek, 'Ordered'));

            });

        });
        
        describe('Tooltip Number of Executions Property', () => {

            it('Sums @ActualExecutions over each RunTimeCountersPerThread elements', () => {

                var container = helper.showPlan(plan_MyCommentScoreDistribution);
                var indexSeek = helper.findNodeById(container, '4', '1');
                assert.equal('8', helper.getProperty(indexSeek, 'Number of Executions'));

            });

        });
        
        describe('Tooltip Action Numer of Rows Property', () => {

            it('Sums @ActualRows over each RunTimeCountersPerThread elements', () => {

                var container = helper.showPlan(plan_MyCommentScoreDistribution);
                var indexSeek = helper.findNodeById(container, '4', '1');
                assert.equal('413', helper.getProperty(indexSeek, 'Actual Number of Rows'));

            });

        });
        
        describe('Tooltip Order By', () => {

            it('Shows Ascending with @Ascending = true', () => {

                var container = helper.showPlan(plan_KeysetCursor);
                var sort = helper.findNodeById(container, '4', '2');
                assert.equal('[Northwind].[dbo].[Employee].EmpName Ascending', helper.getToolTipSection(sort, 'Order By'));

            });

            it('Shows Descending with @Ascending = false', () => {

                var container = helper.showPlan(plan_NestedLoops);
                var sort = helper.findNodeById(container, '1', '1');
                assert.equal('[DataExplorer].[dbo].[Queries].FirstRun Descending', helper.getToolTipSection(sort, 'Order By'));

            });

            it('Shows Ascending with @Ascending = 1', () => {

                var container = helper.showPlan(plan_UpvotesForEachTag);
                var sort = helper.findNodeById(container, '4', '1');
                assert.equal('[StackOverflow.Exported].[dbo].[Tags].TagName Ascending', helper.getToolTipSection(sort, 'Order By'));

            });

            it('Shows Descending with @Ascending = 0', () => {

                var container = helper.showPlan(plan_UpvotesForEachTag);
                var sort = helper.findNodeById(container, '0', '1');
                assert.equal('Expr1012 Descending', helper.getToolTipSection(sort, 'Order By'));

            });

        });
        
        describe('Tooltip Estimated Number of Executions Property', () => {

            it('Equals @EstimateRebinds + 1', () => {

                var container = helper.showPlan(plan_UpvotesForEachTag);
                var clusteredIndexSeek = helper.findNodeById(container, '16', '1');
                assert.equal('25.898', helper.getProperty(clusteredIndexSeek, 'Estimated Number of Executions'));

            });

        });
        
        describe('Tooltip Actual Rebinds Property', () => {

            it('Sums @ActualRebinds over each RunTimeCountersPerThread elements', () => {

                var container = helper.showPlan(plan_UpvotesForEachTag);
                var sort = helper.findNodeById(container, '4', '1');
                assert.equal('8', helper.getProperty(sort, 'Actual Rebinds'));

            });

            it('Is zero when @ActualRebinds is present but sums to 0', () => {

                var container = helper.showPlan(plan_UpvotesForEachTag);
                var sort = helper.findNodeById(container, '5', '1');
                assert.equal('0', helper.getProperty(sort, 'Actual Rebinds'));

            });

            it('Is not present if RunTimeInformation is missing', () => {

                var container = helper.showPlan(plan_UpvotesForEachTag);
                var sort = helper.findNodeById(container, '2', '1');
                assert.equal(null, helper.getProperty(sort, 'Actual Rebinds'));

            });

        });
        
        describe('Tooltip Actual Rewinds Property', () => {

            it('Sums @ActualRewinds over each RunTimeCountersPerThread elements', () => {

                var container = helper.showPlan(plan_UpvotesForEachTag);
                var sort = helper.findNodeById(container, '4', '1');
                assert.equal('0', helper.getProperty(sort, 'Actual Rewinds'));

            });

            it('Is not present if RunTimeInformation is missing', () => {

                var container = helper.showPlan(plan_UpvotesForEachTag);
                var sort = helper.findNodeById(container, '2', '1');
                assert.equal(null, helper.getProperty(sort, 'Actual Rewinds'));

            });

        });
        
        describe('Tooltip Storage Property', () => {

            it('Is not present if */@Storage is not present', () => {

                var container = helper.showPlan(plan_ClusteredIndexScan);
                var clusteredIndexScan = helper.findNodeById(container, '0', '1');
                assert.equal(null, helper.getProperty(clusteredIndexScan, 'Storage'));

            });

            it('Matches IndexScan/@Storage', () => {

                var container = helper.showPlan(plan_KeyLookup);
                var indexSeek = helper.findNodeById(container, '3', '1');
                assert.equal('RowStore', helper.getProperty(indexSeek, 'Storage'));

            });

            it('Matches TableScan/@Storage', () => {

                var container = helper.showPlan(plan_Cursor2);
                var tableScan = helper.findNodeById(container, '2', '4');
                assert.equal('RowStore', helper.getProperty(tableScan, 'Storage'));

            });

        });

        describe('Actual Execution Mode Property', () => {

            it ('Is "Batch" when @ActualExecutionMode = "Batch"', () => {

                var container = helper.showPlan(plan_batchMode);
                var indexScan = helper.findNodeById(container, '4', '1');
                assert.equal('Batch', helper.getProperty(indexScan, 'Actual Execution Mode'));

            });

            it ('Is "Row" when @ActualExecutionMode = "Row"', () => {

                var container = helper.showPlan(plan_batchMode);
                var parallelism = helper.findNodeById(container, '0', '1');
                assert.equal('Row', helper.getProperty(parallelism, 'Actual Execution Mode'));

            });

            it ('Is "Row" when @ActualExecutionMode is missing', () => {

                var container = helper.showPlan(plan_Issue1);
                var nestedLoops = helper.findNodeById(container, '1', '1');
                assert.equal('Row', helper.getProperty(nestedLoops, 'Actual Execution Mode'));

            });

            it ('Is missing for estimated plans', () => {

                var container = helper.showPlan(plan_batchModeEstimated);
                var indexScan = helper.findNodeById(container, '4', '1');
                assert.equal(null, helper.getProperty(indexScan, 'Actual Execution Mode'));

            });

        });

        describe('Actual Number of Batches Mode Property', () => {

            it ('Sums @Batches over each RunTimeCountersPerThread elements', () => {

                var container = helper.showPlan(plan_batchMode);
                var indexScan = helper.findNodeById(container, '4', '1');
                assert.equal('14505', helper.getProperty(indexScan, 'Actual Number of Batches'));

            });

            it ('Is 0 if @Batches is missing', () => {

                var container = helper.showPlan(plan_Issue1);
                var nestedLoops = helper.findNodeById(container, '1', '1');
                assert.equal('0', helper.getProperty(nestedLoops, 'Actual Number of Batches'));

            });

            it ('Is missing for estimated plans', () => {

                var container = helper.showPlan(plan_batchModeEstimated);
                var indexScan = helper.findNodeById(container, '1', '1');
                assert.equal(null, helper.getProperty(indexScan, 'Actual Number of Batches'));

            });

        });

    });

});